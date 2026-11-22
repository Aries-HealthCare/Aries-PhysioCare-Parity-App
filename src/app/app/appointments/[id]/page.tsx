'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarCheck,
  Clock,
  MapPin,
  Phone,
  ArrowLeft,
  Navigation,
  Play,
  Video,
  FileText,
  Calendar,
  AlertCircle,
  MessageCircle,
  MessageSquare,
  Loader2,
  IndianRupee,
  ShieldCheck,
  Stethoscope,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';
import { ApiError } from '@/services/api-transport';

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

function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getRelativeLocalDateKey(offsetDays: number): string {
  const now = new Date();
  return toLocalDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays));
}

function parseAppointmentDate(raw: unknown): Date | null {
  if (!raw) return null;
  const str = String(raw).trim();
  if (!str) return null;
  const isoDateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (isoDateOnly) {
    return new Date(Number(isoDateOnly[1]), Number(isoDateOnly[2]) - 1, Number(isoDateOnly[3]));
  }
  const dmy = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(str);
  if (dmy) {
    return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
  }
  const parsed = new Date(str);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatAddress(rawAddress: unknown, fallback: string): string {
  if (!rawAddress) return fallback;
  if (typeof rawAddress === 'string') return rawAddress.trim() || fallback;
  if (typeof rawAddress === 'object') {
    const a = rawAddress as Record<string, unknown>;
    const parts = [a.street, a.addressLine2, a.landMark || a.landmark, a.city, a.state, a.pinCode || a.zipCode]
      .map((p) => (p ? String(p).trim() : ''))
      .filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : fallback;
  }
  return fallback;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AppointmentDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const appointmentId = resolvedParams.id;
  const router = useRouter();
  const { user } = useProviderAuth();
  const { toast } = useToast();

  const [appointment, setAppointment] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(() => getRelativeLocalDateKey(1));
  const [rescheduleTime, setRescheduleTime] = useState('10:00 AM');
  const [rescheduleRemark, setRescheduleRemark] = useState('');
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const todayIso = getRelativeLocalDateKey(0);

  const fetchAppointment = useCallback(async () => {
    if (!appointmentId) return;
    setIsLoading(true);
    setError(null);
    try {
      const list = await providerApi.getAppointments(user?._id);
      const match = Array.isArray(list)
        ? list.find((item: any) => String(item._id || item.id) === String(appointmentId))
        : null;

      if (match) {
        setAppointment(match);
      } else {
        setAppointment(null);
        setError('Appointment not found or you do not have permission to view it.');
      }
    } catch (err: any) {
      setAppointment(null);
      setError(err?.message || 'Failed to retrieve appointment details.');
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId, user?._id]);

  useEffect(() => {
    void fetchAppointment();
  }, [fetchAppointment]);

  useEffect(() => {
    if (!rescheduleOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isRescheduling) {
        setRescheduleOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [rescheduleOpen, isRescheduling]);

  const openReschedule = () => {
    const rawDate = appointment?.appointmentDate || appointment?.scheduledAt || appointment?.scheduledDate;
    const parsed = parseAppointmentDate(rawDate);
    const key = parsed ? toLocalDateKey(parsed) : '';
    const existingTime = String(appointment?.appointmentTime || appointment?.timeSlot || '').trim();
    setRescheduleDate(key && key >= todayIso ? key : getRelativeLocalDateKey(1));
    setRescheduleTime(TIME_SLOTS.includes(existingTime) ? existingTime : '10:00 AM');
    setRescheduleRemark('');
    setRescheduleError(null);
    setRescheduleOpen(true);
  };

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setRescheduleError(null);
    if (!rescheduleDate || !rescheduleTime) {
      setRescheduleError('Please choose both a date and time slot.');
      return;
    }

    setIsRescheduling(true);
    try {
      const res = await providerApi.rescheduleAppointment({
        appointmentId,
        appointmentDate: rescheduleDate,
        appointmentTime: rescheduleTime,
        remark: rescheduleRemark.trim() || 'Rescheduled by therapist',
      });
      if (res.success === false) {
        throw new Error(res.message || 'Unable to reschedule appointment.');
      }
      toast({
        title: 'Appointment rescheduled',
        description: `Updated to ${rescheduleDate} at ${rescheduleTime}.`,
      });
      setRescheduleOpen(false);
      await fetchAppointment();
    } catch (err: any) {
      const isConflict =
        err instanceof ApiError
          ? err.statusCode === 409
          : err?.statusCode === 409 || err?.status === 409;
      const msg = String(err?.message || '');
      if (isConflict || msg.toLowerCase().includes('already has an appointment')) {
        setRescheduleError(
          msg || 'Schedule conflict: you already have an appointment at this date and time.'
        );
      } else {
        setRescheduleError(msg || 'Failed to reschedule appointment. Please try again.');
      }
    } finally {
      setIsRescheduling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-12 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Retrieving appointment itinerary...</p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-4">
        <Link
          href="/app/appointments"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Appointments</span>
        </Link>
        <Card className="border-red-500/30 bg-red-500/5 rounded-3xl">
          <CardContent className="p-6 flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-red-600">Appointment Unavailable</h2>
              <p className="text-xs text-muted-foreground mt-1">
                {error || 'Appointment record could not be loaded.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 text-xs rounded-xl"
                onClick={() => router.push('/app/appointments')}
              >
                Return to Appointments Schedule
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const patient =
    appointment.patient && typeof appointment.patient === 'object'
      ? appointment.patient
      : appointment.patientDetails && typeof appointment.patientDetails === 'object'
        ? appointment.patientDetails
        : {};
  const patientId = String(
    patient._id || patient.id || (typeof appointment.patient === 'string' ? appointment.patient : '') || ''
  );
  const patientName =
    `${patient.firstName || ''} ${patient.lastName || ''}`.trim() ||
    patient.fullName ||
    patient.name ||
    appointment.patientName ||
    'Patient';
  const phone = String(patient.phone || patient.mobileNo || appointment.phone || '').trim();
  const condition = String(
    patient.condition ||
      appointment.condition ||
      (Array.isArray(patient.medicalConditions) ? patient.medicalConditions.filter(Boolean).join(', ') : '') ||
      'Physiotherapy Session'
  );
  const modeStr = String(
    appointment.consultationType ||
      appointment.mode ||
      appointment.visitType ||
      appointment.appointmentType ||
      ''
  ).toLowerCase();
  const isTelehealth =
    appointment.isTelehealth === true ||
    modeStr.includes('tele') ||
    modeStr.includes('video');
  const isClinic = !isTelehealth && String(appointment.visitType || '').toLowerCase() === 'clinic';
  const serviceType = isTelehealth
    ? 'Tele-Rehab Session'
    : isClinic
      ? 'Clinic Visit'
      : 'Home Doorstep Visit';

  const rawDate = appointment.appointmentDate || appointment.scheduledAt || appointment.scheduledDate;
  const parsedDate = parseAppointmentDate(rawDate);
  const formattedDate = parsedDate
    ? parsedDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : 'Date TBD';
  const timeText = String(appointment.appointmentTime || appointment.timeSlot || '').trim();
  const scheduledDisplay = timeText ? `${formattedDate} · ${timeText}` : formattedDate;

  const addressStr = formatAddress(patient.address, String(appointment.location || 'Address not specified'));
  const sessionNum = Number(appointment.sessionIndex || appointment.sessionNumber || 0) || 0;
  const totalSessions = Number(appointment.totalSessions || 0) || 0;
  const fee = Number(appointment.sessionAmount ?? appointment.fee ?? appointment.amount ?? appointment.therapistSessionAmount ?? appointment.perSessionPrice ?? 0) || 0;
  const status = String(appointment.appointmentStatus || appointment.status || 'scheduled')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  const isCompleted = status === 'completed' || status === 'closed' || status === 'done';
  const isCancelled = status === 'cancelled' || status === 'canceled';
  const canReschedule = !isCompleted && !isCancelled;

  const emrHref = patientId
    ? `/app/patients/${encodeURIComponent(patientId)}`
    : `/app/patients?search=${encodeURIComponent(patientName)}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/app/appointments"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Appointments</span>
        </Link>
        <span className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full border border-border/60">
          ID: {appointmentId.slice(-8)}
        </span>
      </div>

      {/* Hero Card */}
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-white shadow-sm">
                {serviceType}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  isCompleted
                    ? 'bg-emerald-500/20 text-emerald-600'
                    : isCancelled
                      ? 'bg-red-500/15 text-red-600'
                      : status === 'in_progress'
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                        : 'bg-blue-500/20 text-blue-600'
                }`}
              >
                {status.replace(/_/g, ' ')}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {patientName}
              </h1>
              <p className="text-sm font-semibold text-primary mt-1 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 shrink-0" />
                <span>{condition}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold text-foreground">{scheduledDisplay}</span>
              </div>
              {sessionNum > 0 && (
                <div className="flex items-center gap-1.5">
                  <CalendarCheck className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    {totalSessions > 0 ? `Session ${sessionNum} of ${totalSessions}` : `Session #${sessionNum}`}
                  </span>
                </div>
              )}
              {fee > 0 && (
                <div className="flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-bold text-foreground">{fee.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            {isTelehealth ? (
              <Button
                asChild
                className="h-11 px-5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20"
              >
                <Link href={`/app/telehealth?appointmentId=${encodeURIComponent(appointmentId)}`}>
                  <Video className="w-4 h-4 mr-2" />
                  <span>Start Tele-Rehab Session</span>
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                className="h-11 px-5 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/20"
              >
                <Link href={`/app/visits?apt=${encodeURIComponent(appointmentId)}`}>
                  <Play className="w-4 h-4 mr-2" />
                  <span>{isClinic ? 'Launch Clinic Visit Flow' : 'Launch Home Visit Flow'}</span>
                </Link>
              </Button>
            )}

            <div className="flex flex-wrap sm:flex-nowrap lg:flex-col gap-2">
              {canReschedule && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={openReschedule}
                  className="h-10 px-5 rounded-2xl font-bold text-xs border-primary/40 text-primary hover:bg-primary/5 flex-1"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Reschedule Slot</span>
                </Button>
              )}

              <Button
                asChild
                variant="outline"
                className="h-10 px-5 rounded-2xl font-bold text-xs border-border/80 hover:bg-muted flex-1"
              >
                <Link href={emrHref}>
                  <FileText className="w-4 h-4 mr-2" />
                  <span>View Patient EMR</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Patient Contacts & Clinical Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact & Location */}
        <Card className="rounded-3xl border-border/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-extrabold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Contact &amp; Doorstep Location</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Primary Address</span>
              <p className="font-semibold text-foreground mt-0.5 leading-relaxed">{addressStr}</p>
            </div>

            {phone && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/60">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Contact Phone</span>
                  <span className="font-mono font-bold text-foreground text-sm">{phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 rounded-xl border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 font-bold gap-1.5"
                    onClick={() => window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank', 'noopener,noreferrer')}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="h-8 px-3 rounded-xl bg-primary text-white font-bold gap-1.5"
                  >
                    <a href={`tel:${phone}`}>
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                  </Button>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                className="w-full h-9 rounded-xl text-xs font-bold text-primary border-primary/30 hover:bg-primary/5 gap-2"
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressStr)}`,
                    '_blank',
                    'noopener,noreferrer'
                  )
                }
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Open in Google Maps Navigation</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Session Specifications */}
        <Card className="rounded-3xl border-border/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-extrabold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Clinical Session Specifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground block text-[11px]">Prescribed Condition</span>
                <p className="font-bold text-foreground mt-0.5">{condition}</p>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Service Delivery Mode</span>
                <p className="font-bold text-foreground mt-0.5">{serviceType}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/60">
              <div>
                <span className="text-muted-foreground block text-[11px]">Session Progress</span>
                <p className="font-semibold text-foreground mt-0.5">
                  {sessionNum > 0
                    ? totalSessions > 0
                      ? `Session ${sessionNum} of ${totalSessions}`
                      : `Session #${sessionNum}`
                    : 'Not numbered'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Per-Session Fee</span>
                <p className="font-semibold text-emerald-600 mt-0.5">
                  {fee > 0 ? `₹${fee.toLocaleString('en-IN')}` : 'Configured per package'}
                </p>
              </div>
            </div>

            {appointment.remark && (
              <div className="pt-3 border-t border-border/60">
                <span className="text-muted-foreground block text-[11px]">Schedule Remark</span>
                <p className="font-medium text-foreground mt-0.5">{String(appointment.remark)}</p>
              </div>
            )}

            <div className="pt-3 border-t border-border/60">
              <span className="text-muted-foreground block text-[11px]">Clinical Documentation</span>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Complete arrival check-in, clinical assessment, and post-visit settlement in the Visit Engine to record this session.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inline Reschedule Modal */}
      {rescheduleOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-reschedule-title"
          onClick={() => {
            if (!isRescheduling) setRescheduleOpen(false);
          }}
        >
          <div
            className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <div>
                <h3 id="detail-reschedule-title" className="text-base font-extrabold text-foreground">
                  Reschedule Appointment
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Patient: <strong className="text-foreground">{patientName}</strong>
                </p>
              </div>
              <button
                type="button"
                aria-label="Close reschedule modal"
                disabled={isRescheduling}
                onClick={() => setRescheduleOpen(false)}
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

            <form onSubmit={handleConfirmReschedule} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label htmlFor="detail-reschedule-date" className="font-bold text-foreground block">
                  New Date
                </label>
                <input
                  id="detail-reschedule-date"
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
                <label htmlFor="detail-reschedule-time" className="font-bold text-foreground block">
                  New Time Slot
                </label>
                <select
                  id="detail-reschedule-time"
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
                <label htmlFor="detail-reschedule-remark" className="font-bold text-foreground block">
                  Remark <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <textarea
                  id="detail-reschedule-remark"
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
                  onClick={() => setRescheduleOpen(false)}
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

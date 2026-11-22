'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Phone,
  MapPin,
  Calendar,
  FileText,
  Activity,
  ArrowLeft,
  HeartPulse,
  Share2,
  AlertCircle,
  MessageCircle,
  TrendingUp,
  Loader2,
  CalendarPlus,
  Receipt,
  Star,
  Pencil,
  Clock,
  ClipboardList,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { EditPatientDialog } from '@/components/patients/edit-patient-dialog';
import { useToast } from '@/hooks/use-toast';
import { providerApi } from '@/services/provider-api';

interface PageProps {
  params: Promise<{ id: string }>;
}

function normalizePhone(raw: unknown): string {
  return String(raw || '').replace(/\D/g, '').slice(-10);
}

function formatAddress(rawAddress: unknown, fallback?: unknown): string {
  if (rawAddress && typeof rawAddress === 'string') return rawAddress.trim() || String(fallback || '');
  if (rawAddress && typeof rawAddress === 'object') {
    const a = rawAddress as Record<string, unknown>;
    const parts = [
      a.street,
      a.addressLine2,
      a.landMark || a.landmark,
      a.city,
      a.state,
      a.pinCode || a.pincode || a.zipCode,
    ]
      .map((v) => (v ? String(v).trim() : ''))
      .filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
  }
  return fallback ? String(fallback).trim() : 'Address not recorded';
}

function extractReportList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>;
        return String(obj.url || obj.uri || obj.name || obj.title || '').trim();
      }
      return '';
    })
    .filter(Boolean);
}

function isHttpUrl(str: string): boolean {
  return /^https?:\/\//i.test(str);
}

function formatShortDate(raw?: unknown): string {
  if (!raw) return 'Date TBD';
  const d = new Date(String(raw));
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getAppointmentStatusMeta(apt: any): { label: string; className: string; isCompleted: boolean } {
  const raw = String(apt?.appointmentStatus || apt?.status || 'scheduled')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  if (raw === 'completed' || raw === 'closed' || raw === 'done') {
    return {
      label: 'Completed',
      className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      isCompleted: true,
    };
  }
  if (raw === 'in_progress' || raw === 'inprogress' || raw === 'ongoing') {
    return {
      label: 'In Progress',
      className: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
      isCompleted: false,
    };
  }
  if (raw === 'cancelled' || raw === 'canceled') {
    return {
      label: 'Cancelled',
      className: 'bg-red-500/10 text-red-600 border-red-500/20',
      isCompleted: false,
    };
  }
  return {
    label: 'Scheduled',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    isCompleted: false,
  };
}

function getAppointmentPatientId(apt: any): string {
  if (!apt) return '';
  if (typeof apt.patient === 'string') return apt.patient;
  return String(apt.patient?._id || apt.patient?.id || apt.patientDetails?._id || apt.patientId || '');
}

function getAppointmentPatientName(apt: any): string {
  const core = apt?.patient && typeof apt.patient === 'object'
    ? apt.patient
    : apt?.patientDetails && typeof apt.patientDetails === 'object'
      ? apt.patientDetails
      : {};
  return (
    `${core.firstName || ''} ${core.lastName || ''}`.trim() ||
    core.fullName ||
    core.name ||
    apt?.patientName ||
    ''
  );
}

export default function PatientDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const patientId = resolvedParams.id;
  const router = useRouter();
  const { toast } = useToast();

  const [patient, setPatient] = useState<any | null>(null);
  const [visitHistory, setVisitHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSendingReview, setIsSendingReview] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const loadPatientData = useCallback(async () => {
    if (!patientId) return;
    setIsLoading(true);
    setError(null);

    try {
      let resolvedPatient: any = null;

      try {
        const direct = await providerApi.getPatientById(patientId);
        if (direct && typeof direct === 'object' && (direct._id || direct.id || direct.patient)) {
          resolvedPatient = direct;
        }
      } catch {
        // Fall back to exact match in providerApi.getPatients()
      }

      if (!resolvedPatient) {
        const list = await providerApi.getPatients();
        if (Array.isArray(list)) {
          resolvedPatient =
            list.find((item: any) => {
              const ids = [item?._id, item?.id, item?.patient?._id, item?.patient?.id]
                .filter(Boolean)
                .map(String);
              return ids.includes(String(patientId));
            }) || null;
        }
      }

      if (!resolvedPatient) {
        setPatient(null);
        setVisitHistory([]);
        setError('Patient record not found or you do not have permission to view this file.');
        return;
      }

      setPatient(resolvedPatient);

      // Load real appointments filtered to this patient (gracefully degrade if appointments fail)
      try {
        const allAppointments = await providerApi.getAppointments();
        if (Array.isArray(allAppointments)) {
          const core =
            resolvedPatient.patient && typeof resolvedPatient.patient === 'object'
              ? resolvedPatient.patient
              : resolvedPatient.patientDetails && typeof resolvedPatient.patientDetails === 'object'
                ? resolvedPatient.patientDetails
                : resolvedPatient;

          const knownIds = new Set(
            [patientId, resolvedPatient._id, resolvedPatient.id, core?._id, core?.id]
              .filter(Boolean)
              .map(String)
          );
          const patientPhone = normalizePhone(
            core?.phone || core?.mobileNo || resolvedPatient?.phone || resolvedPatient?.mobileNo
          );
          const patientFullName = (
            `${core?.firstName || ''} ${core?.lastName || ''}`.trim() ||
            core?.fullName ||
            core?.name ||
            resolvedPatient?.fullName ||
            resolvedPatient?.name ||
            ''
          ).toLowerCase();

          const matched = allAppointments
            .filter((apt: any) => {
              const aptPid = getAppointmentPatientId(apt);
              if (aptPid && knownIds.has(aptPid)) return true;

              const aptPhone = normalizePhone(
                apt?.patient?.phone || apt?.patientDetails?.phone || apt?.phone
              );
              if (patientPhone && aptPhone && patientPhone === aptPhone) return true;

              const aptName = getAppointmentPatientName(apt).toLowerCase();
              if (patientFullName && aptName && patientFullName === aptName) return true;

              return false;
            })
            .sort((a: any, b: any) => {
              const da = new Date(
                a?.appointmentDate || a?.scheduledAt || a?.scheduledDate || a?.createdAt || 0
              ).getTime();
              const db = new Date(
                b?.appointmentDate || b?.scheduledAt || b?.scheduledDate || b?.createdAt || 0
              ).getTime();
              return (Number.isFinite(db) ? db : 0) - (Number.isFinite(da) ? da : 0);
            });

          setVisitHistory(matched);
        } else {
          setVisitHistory([]);
        }
      } catch {
        setVisitHistory([]);
      }
    } catch (err: any) {
      setPatient(null);
      setVisitHistory([]);
      setError(err?.message || 'Failed to retrieve patient profile.');
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    void loadPatientData();
  }, [loadPatientData]);

  const handleSendReview = async () => {
    if (!patient) return;
    const pId = String(patient._id || patient.id || patientId);
    setIsSendingReview(true);
    try {
      const res = await providerApi.requestPatientReview(pId);
      if (res.success) {
        toast({
          title: 'Review invitation sent',
          description: `Sent to ${res.data?.phoneNumber || 'patient'} via WhatsApp.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Could not send review request',
          description: res.message || 'Please try again.',
        });
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Review request failed',
        description: err?.message || 'Unable to send review invitation right now.',
      });
    } finally {
      setIsSendingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-12 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Loading clinical patient record...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-4">
        <Link
          href="/app/patients"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Patients</span>
        </Link>
        <Card className="border-red-500/30 bg-red-500/5 rounded-3xl">
          <CardContent className="p-6 flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-red-600">Patient File Not Found</h2>
              <p className="text-xs text-muted-foreground mt-1">
                {error || 'Patient record could not be loaded.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 text-xs rounded-xl"
                onClick={() => router.push('/app/patients')}
              >
                Return to Patient Roster
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pDetails =
    patient.patient && typeof patient.patient === 'object'
      ? patient.patient
      : patient.patientDetails && typeof patient.patientDetails === 'object'
        ? patient.patientDetails
        : patient;

  const fullName =
    `${pDetails.firstName || ''} ${pDetails.lastName || ''}`.trim() ||
    pDetails.fullName ||
    pDetails.name ||
    patient.fullName ||
    patient.name ||
    'Patient';

  const age = Number(pDetails.age || patient.age || 0) || 0;
  const gender = String(pDetails.gender || patient.gender || '').trim();
  const phone = String(pDetails.phone || pDetails.mobileNo || patient.phone || patient.mobileNo || '').trim();

  const medicalConditions: string[] = Array.isArray(pDetails.medicalConditions)
    ? pDetails.medicalConditions.filter(Boolean).map(String)
    : Array.isArray(patient.medicalConditions)
      ? patient.medicalConditions.filter(Boolean).map(String)
      : [];

  const condition = String(
    patient.condition ||
      pDetails.condition ||
      patient.diagnosis ||
      medicalConditions.join(', ') ||
      'Not specified'
  );

  const completedFromHistory = visitHistory.filter((a) => getAppointmentStatusMeta(a).isCompleted).length;
  const scheduledFromHistory = visitHistory.filter(
    (a) => getAppointmentStatusMeta(a).label === 'Scheduled' || getAppointmentStatusMeta(a).label === 'In Progress'
  ).length;
  const completedSessions = Math.max(
    Number(patient.completedSessions || patient.sessionsDone || 0) || 0,
    completedFromHistory
  );
  const totalSessions = Number(patient.totalSessions || patient.sessionsCount || 0) || 0;
  const progressPct = totalSessions > 0 ? Math.min(100, Math.round((completedSessions / totalSessions) * 100)) : 0;

  const addressStr = formatAddress(pDetails.address ?? patient.address, patient.location || pDetails.city || patient.city);
  const packageName = String(patient.packageName || patient.packageType || '').trim();

  const investigationReports = extractReportList(
    pDetails.investigationReports ?? patient.investigationReports
  );
  const medicalReports = extractReportList(
    pDetails.medicalReports ?? pDetails.prescriptions ?? patient.medicalReports ?? patient.prescriptions
  );

  const demographics = [gender || null, age > 0 ? `${age} yrs` : null].filter(Boolean).join(' · ');
  const referHref = `/app/refer-patient?patientName=${encodeURIComponent(fullName)}&phone=${encodeURIComponent(phone)}`;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/app/patients"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Patients</span>
        </Link>
        <span className="text-[11px] font-mono text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full border border-border/60">
          Patient ID: {patientId.slice(-8)}
        </span>
      </div>

      {/* Patient Header Card */}
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-2xl shrink-0">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{fullName}</h1>
                {demographics && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-muted text-muted-foreground border border-border/60">
                    {demographics}
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-primary flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 shrink-0" />
                <span>{condition}</span>
              </p>
              <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <span>{addressStr}</span>
              </p>
            </div>
          </div>

          {/* Direct Actions */}
          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setEditOpen(true)}
              className="h-9 px-4 rounded-xl border-primary/40 text-primary hover:bg-primary/5 font-bold text-xs gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Patient</span>
            </Button>

            {phone && (
              <>
                <Button
                  asChild
                  size="sm"
                  className="h-9 px-4 rounded-xl bg-primary text-white font-bold text-xs gap-1.5 shadow-sm"
                >
                  <a href={`tel:${phone}`}>
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Patient</span>
                  </a>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-9 px-4 rounded-xl border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 font-bold text-xs gap-1.5"
                  onClick={() =>
                    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank', 'noopener,noreferrer')
                  }
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Chat</span>
                </Button>
              </>
            )}

            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isSendingReview}
              className="h-9 px-4 rounded-xl border-amber-500/40 text-amber-600 hover:bg-amber-500/10 font-bold text-xs gap-1.5"
              onClick={() => void handleSendReview()}
            >
              {isSendingReview ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5" />}
              <span>Send Review Request</span>
            </Button>
          </div>
        </div>

        {/* Real Progress Bar or Visit Summary */}
        <div className="mt-6 pt-5 border-t border-border/60">
          {totalSessions > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-foreground">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>Care Plan Session Progress</span>
                </span>
                <span className="text-primary font-mono">
                  {completedSessions} of {totalSessions} Sessions ({progressPct}%)
                </span>
              </div>
              <Progress value={progressPct} className="h-2.5 rounded-full bg-muted" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-card/80 border border-border/60">
                <div className="text-lg font-extrabold font-mono text-foreground">{visitHistory.length}</div>
                <div className="text-[11px] text-muted-foreground font-medium">Total Visits</div>
              </div>
              <div className="p-3 rounded-2xl bg-card/80 border border-border/60">
                <div className="text-lg font-extrabold font-mono text-emerald-600">{completedSessions}</div>
                <div className="text-[11px] text-muted-foreground font-medium">Completed</div>
              </div>
              <div className="p-3 rounded-2xl bg-card/80 border border-border/60">
                <div className="text-lg font-extrabold font-mono text-primary">{scheduledFromHistory}</div>
                <div className="text-[11px] text-muted-foreground font-medium">Scheduled</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Button
          asChild
          variant="outline"
          className="h-16 rounded-2xl border-border/80 hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-xs font-bold"
        >
          <Link href="/app/appointments">
            <CalendarPlus className="w-4 h-4 text-primary" />
            <span>Appointments</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="h-16 rounded-2xl border-border/80 hover:border-teal-500/50 flex flex-col items-center justify-center gap-1 text-xs font-bold"
        >
          <Link href={`/app/visits?patient=${encodeURIComponent(fullName)}`}>
            <Activity className="w-4 h-4 text-teal-600" />
            <span>Start Visit</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="h-16 rounded-2xl border-border/80 hover:border-emerald-500/50 flex flex-col items-center justify-center gap-1 text-xs font-bold"
        >
          <Link href="/app/invoices">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <span>Billing &amp; Invoices</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="h-16 rounded-2xl border-border/80 hover:border-purple-500/50 flex flex-col items-center justify-center gap-1 text-xs font-bold"
        >
          <Link href={referHref}>
            <Share2 className="w-4 h-4 text-purple-600" />
            <span>Refer Specialist</span>
          </Link>
        </Button>
      </div>

      {/* Responsive 2-Column Desktop EMR Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Clinical Profile & Reports */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>Clinical Profile &amp; Contact</span>
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="h-8 px-2.5 rounded-xl text-xs font-bold text-primary"
              >
                <Pencil className="w-3.5 h-3.5 mr-1" />
                Edit
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Primary Diagnosis / Condition
                </span>
                <p className="font-bold text-foreground text-sm">{condition}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Phone Number
                  </span>
                  <p className="font-mono font-bold text-foreground">{phone || 'Not recorded'}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Care Package
                  </span>
                  <p className="font-bold text-foreground">{packageName || 'Not assigned'}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Doorstep Address
                </span>
                <p className="font-medium text-foreground leading-relaxed">{addressStr}</p>
              </div>
            </CardContent>
          </Card>

          {/* Investigation Reports & Prescriptions */}
          <Card className="rounded-3xl border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-extrabold flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-primary" />
                <span>Reports &amp; Prescriptions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Investigation Reports ({investigationReports.length})
                </span>
                {investigationReports.length === 0 ? (
                  <p className="text-muted-foreground italic">No investigation reports recorded.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {investigationReports.map((item, idx) => (
                      <li
                        key={`inv-${idx}`}
                        className="p-2.5 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between gap-2"
                      >
                        <span className="truncate font-medium text-foreground">{item}</span>
                        {isHttpUrl(item) && (
                          <a
                            href={item}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline shrink-0 inline-flex items-center gap-1 font-bold"
                          >
                            Open <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2 pt-3 border-t border-border/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Doctor Prescriptions &amp; Medical Reports ({medicalReports.length})
                </span>
                {medicalReports.length === 0 ? (
                  <p className="text-muted-foreground italic">No prescriptions recorded.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {medicalReports.map((item, idx) => (
                      <li
                        key={`med-${idx}`}
                        className="p-2.5 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between gap-2"
                      >
                        <span className="truncate font-medium text-foreground">{item}</span>
                        {isHttpUrl(item) && (
                          <a
                            href={item}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline shrink-0 inline-flex items-center gap-1 font-bold"
                          >
                            Open <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Real Visit History Timeline */}
        <Card className="rounded-3xl border-border/80 shadow-sm h-fit">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-extrabold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Visit History Timeline</span>
            </CardTitle>
            <span className="text-xs font-bold text-muted-foreground">
              {visitHistory.length} {visitHistory.length === 1 ? 'visit' : 'visits'}
            </span>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {visitHistory.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-border/80 text-center space-y-2 text-muted-foreground">
                <Calendar className="w-8 h-8 mx-auto opacity-40" />
                <p className="font-bold text-foreground">No recorded visits yet</p>
                <p className="text-xs">
                  Scheduled and completed appointments for {fullName} will appear in this timeline.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {visitHistory.map((apt, idx) => {
                  const aptId = String(apt._id || apt.id || `visit-${idx}`);
                  const statusMeta = getAppointmentStatusMeta(apt);
                  const dateLabel = formatShortDate(
                    apt.appointmentDate || apt.scheduledAt || apt.scheduledDate || apt.createdAt
                  );
                  const timeLabel = String(apt.appointmentTime || apt.timeSlot || '').trim();
                  const sessionNo = Number(apt.sessionIndex || apt.sessionNumber || 0) || 0;
                  const fee =
                    Number(apt.fee ?? apt.amount ?? apt.therapistSessionAmount ?? apt.perSessionPrice ?? 0) || 0;

                  return (
                    <Link
                      key={aptId}
                      href={`/app/appointments/${encodeURIComponent(aptId)}`}
                      prefetch={false}
                      className="block p-4 rounded-2xl bg-muted/30 hover:bg-muted/60 border border-border/60 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-foreground">{dateLabel}</span>
                            {timeLabel && (
                              <span className="text-muted-foreground font-medium">· {timeLabel}</span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                            <span>{sessionNo > 0 ? `Session #${sessionNo}` : 'Clinical Session'}</span>
                            {fee > 0 && (
                              <span className="font-mono font-bold text-foreground">
                                · ₹{fee.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${statusMeta.className}`}
                        >
                          {statusMeta.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Patient Dialog */}
      <EditPatientDialog
        patient={patient}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={() => {
          void loadPatientData();
        }}
      />
    </div>
  );
}

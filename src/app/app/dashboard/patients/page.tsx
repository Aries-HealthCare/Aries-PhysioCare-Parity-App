'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  History,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { EmptyState, ErrorState, PageSkeleton, StatusBadge } from '@/components/ds';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBackendQuery } from '@/hooks/use-backend-query';
import { providerApi } from '@/services/provider-api';

type PatientFilterStatus = 'ALL' | 'ACTIVE' | 'SCHEDULED' | 'COMPLETED';

interface EnrichedPatient {
  id: string;
  name: string;
  initial: string;
  phone: string;
  age?: number | string;
  gender?: string;
  condition: string;
  city: string;
  status: 'ACTIVE' | 'SCHEDULED' | 'COMPLETED';
  visitsCount: number;
  lastVisitDate: string;
  appointments: any[];
}

function normalizeAppointmentStatus(apt: any): string {
  return String(apt?.appointmentStatus || apt?.status || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

function formatDate(raw?: string): string {
  if (!raw) return 'No visits yet';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function resolveAppointmentPatientId(apt: any): string {
  if (!apt) return '';
  if (typeof apt.patient === 'string') return apt.patient;
  return String(apt.patient?._id || apt.patient?.id || apt.patientId || '');
}

function resolveAppointmentPhone(apt: any): string {
  const raw = apt?.patient?.phone || apt?.patientDetails?.phone || apt?.phone || '';
  return String(raw).replace(/\D/g, '').slice(-10);
}

function buildEnrichedPatients(patients: any[], appointments: any[]): EnrichedPatient[] {
  const apptsByPatientId = new Map<string, any[]>();
  const apptsByPhone = new Map<string, any[]>();

  for (const apt of appointments) {
    const pid = resolveAppointmentPatientId(apt);
    if (pid) {
      const list = apptsByPatientId.get(pid) || [];
      list.push(apt);
      apptsByPatientId.set(pid, list);
    }
    const phone = resolveAppointmentPhone(apt);
    if (phone) {
      const list = apptsByPhone.get(phone) || [];
      list.push(apt);
      apptsByPhone.set(phone, list);
    }
  }

  return patients.map((p, idx) => {
    const id = String(p?._id || p?.id || `patient-${idx}`);
    const fullName =
      p?.fullName ||
      p?.name ||
      [p?.firstName, p?.lastName].filter(Boolean).join(' ').trim() ||
      'Patient';
    const cleanPhone = String(p?.phone || p?.mobileNo || p?.mobile || '')
      .replace(/\D/g, '')
      .slice(-10);

    const matchedApts =
      apptsByPatientId.get(id) || (cleanPhone ? apptsByPhone.get(cleanPhone) : undefined) || [];

    // Sort appointments newest first
    const sortedApts = [...matchedApts].sort((a, b) => {
      const da = new Date(a?.appointmentDate || a?.scheduledDate || a?.createdAt || 0).getTime();
      const db = new Date(b?.appointmentDate || b?.scheduledDate || b?.createdAt || 0).getTime();
      return (Number.isFinite(db) ? db : 0) - (Number.isFinite(da) ? da : 0);
    });

    const statuses = sortedApts.map(normalizeAppointmentStatus);
    const hasInProgress = statuses.some((s) => s === 'in_progress' || s === 'ongoing' || s === 'active');
    const hasScheduled = statuses.some(
      (s) => s === 'scheduled' || s === 'confirmed' || s === 'pending' || s === 'upcoming'
    );
    const hasCompleted = statuses.some((s) => s === 'completed' || s === 'done');

    let derivedStatus: 'ACTIVE' | 'SCHEDULED' | 'COMPLETED';
    if (hasInProgress || (hasCompleted && hasScheduled)) {
      derivedStatus = 'ACTIVE';
    } else if (hasScheduled) {
      derivedStatus = 'SCHEDULED';
    } else if (hasCompleted) {
      derivedStatus = 'COMPLETED';
    } else {
      const rawStatus = String(p?.status || '').trim().toLowerCase();
      if (rawStatus === 'completed' || rawStatus === 'discharged') {
        derivedStatus = 'COMPLETED';
      } else if (rawStatus === 'scheduled') {
        derivedStatus = 'SCHEDULED';
      } else {
        derivedStatus = 'ACTIVE';
      }
    }

    const medicalConds = Array.isArray(p?.medicalConditions)
      ? p.medicalConditions.filter(Boolean).join(', ')
      : '';
    const condition =
      p?.condition ||
      medicalConds ||
      sortedApts[0]?.condition ||
      sortedApts[0]?.treatmentType ||
      'Physiotherapy Care';

    const visitsCount = sortedApts.length > 0 ? sortedApts.length : Number(p?.totalVisits || 0) || 0;
    const lastVisitRaw =
      sortedApts[0]?.appointmentDate ||
      sortedApts[0]?.scheduledDate ||
      sortedApts[0]?.createdAt ||
      p?.lastVisitDate ||
      '';

    return {
      id,
      name: String(fullName),
      initial: String(fullName).trim().charAt(0).toUpperCase() || 'P',
      phone: String(p?.phone || p?.mobileNo || p?.mobile || ''),
      age: p?.age,
      gender: p?.gender,
      condition: String(condition),
      city: String(p?.city || p?.address?.city || ''),
      status: derivedStatus,
      visitsCount,
      lastVisitDate: lastVisitRaw ? formatDate(lastVisitRaw) : 'No visits yet',
      appointments: sortedApts,
    };
  });
}

export default function DashboardPatientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PatientFilterStatus>('ALL');
  const [historyPatient, setHistoryPatient] = useState<EnrichedPatient | null>(null);

  const { data, error, loading, reload } = useBackendQuery(async () => {
    const [patients, appointments] = await Promise.all([
      providerApi.getPatients(),
      providerApi.getAppointments().catch(() => [] as any[]),
    ]);
    return {
      patients: Array.isArray(patients) ? patients : [],
      appointments: Array.isArray(appointments) ? appointments : [],
    };
  }, []);

  useEffect(() => {
    if (!historyPatient) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setHistoryPatient(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [historyPatient]);

  const enrichedPatients = useMemo(
    () => buildEnrichedPatients(data?.patients || [], data?.appointments || []),
    [data?.patients, data?.appointments]
  );

  const counts = useMemo(() => {
    let active = 0;
    let scheduled = 0;
    let completed = 0;
    for (const p of enrichedPatients) {
      if (p.status === 'ACTIVE') active += 1;
      else if (p.status === 'SCHEDULED') scheduled += 1;
      else completed += 1;
    }
    return {
      total: enrichedPatients.length,
      active,
      scheduled,
      completed,
    };
  }, [enrichedPatients]);

  const filteredPatients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return enrichedPatients.filter((p) => {
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.condition.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q)
      );
    });
  }, [enrichedPatients, searchQuery, statusFilter]);

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const statusChips: Array<{ key: PatientFilterStatus; label: string; count: number }> = [
    { key: 'ALL', label: 'ALL', count: counts.total },
    { key: 'ACTIVE', label: 'ACTIVE', count: counts.active },
    { key: 'SCHEDULED', label: 'SCHEDULED', count: counts.scheduled },
    { key: 'COMPLETED', label: 'COMPLETED', count: counts.completed },
  ];

  const retentionInsight =
    counts.completed > 0
      ? `You have ${counts.completed} completed care plan${counts.completed === 1 ? '' : 's'} and ${counts.active} active patient${counts.active === 1 ? '' : 's'}. Checking in with recently discharged patients 7 days post-care drives maintenance follow-ups and referrals.`
      : counts.total > 0
        ? `You are actively managing ${counts.total} patient${counts.total === 1 ? '' : 's'}. Documenting clear home exercise progression after each visit boosts session adherence.`
        : 'Once patients are assigned to your schedule, their live session count, status, and visit history will appear here.';

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
              Clinical Caseload
            </p>
            <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Patients Overview
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor your active caseload, upcoming schedules, and real appointment history per patient.
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
            <Link href="/app/patients" prefetch={false}>
              <Button className="h-10 px-4 rounded-2xl text-xs font-bold gap-2">
                <Users className="w-3.5 h-3.5" />
                <span>Full EMR Directory</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4-Box Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Total
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="font-outfit text-2xl sm:text-3xl font-black mt-2 tabular-nums">{counts.total}</p>
          <p className="text-xs text-muted-foreground mt-1">Assigned patients</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Active
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="font-outfit text-2xl sm:text-3xl font-black mt-2 tabular-nums text-emerald-600">
            {counts.active}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Ongoing rehab</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Scheduled
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="font-outfit text-2xl sm:text-3xl font-black mt-2 tabular-nums text-sky-600">
            {counts.scheduled}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Upcoming visits</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Completed
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-outfit text-2xl sm:text-3xl font-black mt-2 tabular-nums text-purple-600">
            {counts.completed}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Finished sessions</p>
        </div>
      </div>

      {/* Search + Status Filter Chips */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full md:max-w-sm">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, condition, phone..."
            className="pl-10 h-11 rounded-2xl text-xs"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {statusChips.map((chip) => {
            const active = statusFilter === chip.key;
            return (
              <button
                key={chip.key}
                type="button"
                onClick={() => setStatusFilter(chip.key)}
                className={`min-h-[40px] px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all inline-flex items-center gap-1.5 ${
                  active
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
                }`}
              >
                <span>{chip.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    active ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Patient Cards Grid */}
      {filteredPatients.length === 0 ? (
        <EmptyState
          title={enrichedPatients.length === 0 ? 'No patients assigned yet' : 'No matching patients'}
          description={
            enrichedPatients.length === 0
              ? 'Patients you attend will appear here with their real appointment records.'
              : 'Adjust your search or status filter to view other patients.'
          }
          actionLabel={searchQuery || statusFilter !== 'ALL' ? 'Reset Filters' : undefined}
          onAction={
            searchQuery || statusFilter !== 'ALL'
              ? () => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => {
            const statusTone =
              patient.status === 'ACTIVE'
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25'
                : patient.status === 'SCHEDULED'
                  ? 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25'
                  : 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25';

            const demographics = [
              patient.age ? `${patient.age}y` : '',
              patient.gender ? String(patient.gender) : '',
              patient.city ? patient.city : '',
            ]
              .filter(Boolean)
              .join(' • ');

            return (
              <div
                key={patient.id}
                className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm flex flex-col justify-between gap-4 hover:border-primary/35 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary font-outfit font-extrabold text-base flex items-center justify-center shrink-0">
                        {patient.initial}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-extrabold text-foreground truncate">
                          {patient.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {demographics || 'Patient record'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide shrink-0 ${statusTone}`}
                    >
                      {patient.status}
                    </span>
                  </div>

                  <div className="rounded-2xl bg-muted/40 border border-border/60 px-3.5 py-2.5 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Clinical Focus
                    </p>
                    <p className="text-xs font-semibold text-foreground line-clamp-2">
                      {patient.condition}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-2xl border border-border/60 px-3 py-2">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                        Visits
                      </span>
                      <span className="font-mono font-extrabold text-foreground">
                        {patient.visitsCount}
                      </span>
                    </div>
                    <div className="rounded-2xl border border-border/60 px-3 py-2">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground block">
                        Last Visit
                      </span>
                      <span className="font-semibold text-foreground truncate block">
                        {patient.lastVisitDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Link
                    href={`/app/patients/${encodeURIComponent(patient.id)}`}
                    prefetch={false}
                    className="flex-1 min-w-[110px]"
                  >
                    <Button className="w-full h-10 rounded-xl text-xs font-bold">
                      View Profile
                    </Button>
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setHistoryPatient(patient)}
                    className="h-10 px-3 rounded-xl text-xs font-bold gap-1.5"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Visit History</span>
                  </Button>
                  {patient.phone ? (
                    <a
                      href={`tel:${patient.phone}`}
                      aria-label={`Call ${patient.name}`}
                      className="h-10 w-10 rounded-xl border border-border bg-card hover:bg-muted flex items-center justify-center text-emerald-600 transition-colors shrink-0"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Retention Hub */}
      <div className="rounded-3xl border border-primary/25 bg-gradient-to-r from-primary/5 via-card to-card p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-extrabold text-foreground">AI Retention Hub</h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-0.5">
            {retentionInsight}
          </p>
        </div>
        <Link href="/app/appointments" prefetch={false} className="shrink-0">
          <Button variant="outline" className="h-9 px-4 rounded-xl text-xs font-bold border-primary/30 text-primary hover:bg-primary/10">
            View Schedule →
          </Button>
        </Link>
      </div>

      {/* Real Visit History Modal */}
      {historyPatient ? (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="visit-history-title"
          onClick={() => setHistoryPatient(null)}
        >
          <div
            className="bg-card border border-border rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 id="visit-history-title" className="text-base font-extrabold text-foreground truncate">
                  {historyPatient.name} — Visit History
                </h3>
                <p className="text-xs text-muted-foreground">
                  {historyPatient.appointments.length} recorded appointment
                  {historyPatient.appointments.length === 1 ? '' : 's'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryPatient(null)}
                aria-label="Close visit history"
                className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {historyPatient.appointments.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <Calendar className="w-8 h-8 mx-auto text-muted-foreground/50" />
                  <p className="text-sm font-bold text-foreground">No appointments recorded yet</p>
                  <p className="text-xs text-muted-foreground">
                    Appointments scheduled for {historyPatient.name} will appear here automatically.
                  </p>
                </div>
              ) : (
                historyPatient.appointments.map((apt, idx) => {
                  const aptId = String(apt?._id || apt?.id || `apt-${idx}`);
                  const dateLabel = formatDate(apt?.appointmentDate || apt?.scheduledDate || apt?.createdAt);
                  const timeLabel = apt?.appointmentTime || apt?.startTime || apt?.scheduledTime || '';
                  const fee = Number(apt?.totalAmount ?? apt?.sessionFee ?? 0) || 0;
                  const visitType = apt?.visitType || apt?.type || apt?.condition || 'Physiotherapy Visit';
                  return (
                    <div
                      key={aptId}
                      className="rounded-2xl border border-border/80 bg-muted/20 p-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-foreground">{visitType}</span>
                          <StatusBadge value={apt?.appointmentStatus || apt?.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground font-mono">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {dateLabel}
                          </span>
                          {timeLabel ? (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {timeLabel}
                            </span>
                          ) : null}
                          {fee > 0 ? <span>₹{fee.toLocaleString('en-IN')}</span> : null}
                        </div>
                      </div>
                      {apt?._id || apt?.id ? (
                        <Link
                          href={`/app/appointments/${encodeURIComponent(aptId)}`}
                          prefetch={false}
                          className="shrink-0"
                        >
                          <Button variant="outline" className="h-8 px-2.5 rounded-xl text-[11px] font-bold gap-1">
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </Link>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between gap-2">
              <Button variant="outline" onClick={() => setHistoryPatient(null)} className="h-9 rounded-xl text-xs font-bold">
                Close
              </Button>
              <Link href={`/app/patients/${encodeURIComponent(historyPatient.id)}`} prefetch={false}>
                <Button className="h-9 rounded-xl text-xs font-bold">Open Full Profile →</Button>
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

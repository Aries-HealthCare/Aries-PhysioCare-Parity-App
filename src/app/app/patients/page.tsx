'use client';

import React, { Suspense, useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Users,
  Search,
  Phone,
  MapPin,
  Calendar,
  FileText,
  History,
  HeartPulse,
  Loader2,
  RefreshCw,
  MessageSquare,
  Share2,
  Pencil,
  ExternalLink,
  Clock,
  X,
  AlertCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { EditPatientDialog } from '@/components/patients/edit-patient-dialog';
import { useToast } from '@/hooks/use-toast';
import { providerApi } from '@/services/provider-api';
import { useRealtimeEvent } from '@/services/provider-realtime';

function formatAddress(rawAddress: unknown, fallbackCity?: unknown): string {
  if (rawAddress && typeof rawAddress === 'string') return rawAddress.trim();
  if (rawAddress && typeof rawAddress === 'object') {
    const a = rawAddress as Record<string, unknown>;
    const parts = [a.street, a.city, a.state]
      .map((p) => (p ? String(p).trim() : ''))
      .filter(Boolean);
    if (parts.length > 0) return parts.join(', ');
  }
  return fallbackCity ? String(fallbackCity).trim() : '';
}

function normalizePhone(raw: unknown): string {
  return String(raw || '').replace(/\D/g, '').slice(-10);
}

function getPatientId(p: any, fallbackIdx = 0): string {
  return String(p?._id || p?.id || p?.patient?._id || p?.patient?.id || `patient_${fallbackIdx}`);
}

function getPatientName(p: any): string {
  const core = p?.patient && typeof p.patient === 'object'
    ? p.patient
    : p?.patientDetails && typeof p.patientDetails === 'object'
      ? p.patientDetails
      : p || {};
  return (
    `${core.firstName || ''} ${core.lastName || ''}`.trim() ||
    core.fullName ||
    core.name ||
    p?.fullName ||
    p?.name ||
    'Patient'
  );
}

function getAppointmentPatientId(apt: any): string {
  if (!apt) return '';
  if (typeof apt.patient === 'string') return apt.patient;
  return String(apt.patient?._id || apt.patient?.id || apt.patientDetails?._id || apt.patientId || '');
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

function formatShortDate(raw?: unknown): string {
  if (!raw) return 'Date TBD';
  const d = new Date(String(raw));
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface PatientSummaryView {
  id: string;
  raw: any;
  name: string;
  age?: number;
  gender: string;
  phone: string;
  diagnosis: string;
  packageName: string;
  address: string;
  completedSessions: number;
  totalSessions: number;
  lastVisitLabel: string;
  appointments: any[];
}

function PatientsPageContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const { toast } = useToast();

  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [editingPatient, setEditingPatient] = useState<any | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setIsLoading(true);
    try {
      const [patientsRes, appointmentsRes] = await Promise.allSettled([
        providerApi.getPatients(),
        providerApi.getAppointments(),
      ]);

      if (patientsRes.status === 'rejected') {
        throw patientsRes.reason;
      }

      setPatients(Array.isArray(patientsRes.value) ? patientsRes.value : []);
      setAppointments(
        appointmentsRes.status === 'fulfilled' && Array.isArray(appointmentsRes.value)
          ? appointmentsRes.value
          : []
      );
      setLoadError(null);
    } catch (e: any) {
      setLoadError(e?.message || 'Could not load your patient registry from the server.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useRealtimeEvent('lead_approved', () => {
    void loadData(true);
  });

  useEffect(() => {
    if (!selectedPatientId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPatientId(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedPatientId]);

  const enrichedPatients = useMemo<PatientSummaryView[]>(() => {
    const aptsById = new Map<string, any[]>();
    const aptsByPhone = new Map<string, any[]>();
    const aptsByName = new Map<string, any[]>();

    for (const apt of appointments) {
      const pid = getAppointmentPatientId(apt);
      if (pid) {
        const list = aptsById.get(pid) || [];
        list.push(apt);
        aptsById.set(pid, list);
      }
      const pPhone = normalizePhone(apt?.patient?.phone || apt?.patientDetails?.phone || apt?.phone);
      if (pPhone) {
        const list = aptsByPhone.get(pPhone) || [];
        list.push(apt);
        aptsByPhone.set(pPhone, list);
      }
      const pName = getPatientName(apt).toLowerCase();
      if (pName && pName !== 'patient') {
        const list = aptsByName.get(pName) || [];
        list.push(apt);
        aptsByName.set(pName, list);
      }
    }

    return patients.map((p, idx) => {
      const id = getPatientId(p, idx);
      const nestedId = String(p?.patient?._id || p?.patient?.id || '');
      const core = p?.patient && typeof p.patient === 'object'
        ? p.patient
        : p?.patientDetails && typeof p.patientDetails === 'object'
          ? p.patientDetails
          : p || {};

      const name = getPatientName(p);
      const rawPhone = String(core.phone || core.mobileNo || p?.phone || p?.mobileNo || '').trim();
      const phoneKey = normalizePhone(rawPhone);

      const matchedApts =
        aptsById.get(id) ||
        (nestedId ? aptsById.get(nestedId) : undefined) ||
        (phoneKey ? aptsByPhone.get(phoneKey) : undefined) ||
        aptsByName.get(name.toLowerCase()) ||
        [];

      const sortedApts = [...matchedApts].sort((a, b) => {
        const da = new Date(a?.appointmentDate || a?.scheduledAt || a?.scheduledDate || a?.createdAt || 0).getTime();
        const db = new Date(b?.appointmentDate || b?.scheduledAt || b?.scheduledDate || b?.createdAt || 0).getTime();
        return (Number.isFinite(db) ? db : 0) - (Number.isFinite(da) ? da : 0);
      });

      const completedFromApts = sortedApts.filter((a) => getAppointmentStatusMeta(a).isCompleted).length;
      const completedSessions = Math.max(
        Number(p?.completedSessions || p?.sessionsDone || 0) || 0,
        completedFromApts
      );
      const totalSessions = Number(p?.totalSessions || p?.sessionsCount || 0) || 0;

      const lastVisitRaw =
        sortedApts[0]?.appointmentDate ||
        sortedApts[0]?.scheduledAt ||
        sortedApts[0]?.scheduledDate ||
        p?.lastVisitDate ||
        '';

      const medicalConds = Array.isArray(core.medicalConditions)
        ? core.medicalConditions.filter(Boolean).join(', ')
        : Array.isArray(p?.medicalConditions)
          ? p.medicalConditions.filter(Boolean).join(', ')
          : '';

      const diagnosis = String(
        p?.condition ||
          core.condition ||
          p?.diagnosis ||
          medicalConds ||
          sortedApts[0]?.condition ||
          'Not specified'
      );

      const rawAge = Number(core.age || p?.age || 0);

      return {
        id,
        raw: p,
        name,
        age: rawAge > 0 ? rawAge : undefined,
        gender: String(core.gender || p?.gender || '').trim(),
        phone: rawPhone,
        diagnosis,
        packageName: String(p?.packageName || p?.packageType || '').trim(),
        address: formatAddress(core.address ?? p?.address, core.city || p?.city),
        completedSessions,
        totalSessions,
        lastVisitLabel: lastVisitRaw ? formatShortDate(lastVisitRaw) : 'No visits yet',
        appointments: sortedApts,
      };
    });
  }, [patients, appointments]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return enrichedPatients;
    return enrichedPatients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.diagnosis.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q)
    );
  }, [enrichedPatients, searchQuery]);

  const selectedPatient = useMemo(
    () => (selectedPatientId ? enrichedPatients.find((p) => p.id === selectedPatientId) || null : null),
    [enrichedPatients, selectedPatientId]
  );

  const handleReview = async (p: PatientSummaryView) => {
    setReviewingId(p.id);
    try {
      const res = await providerApi.requestPatientReview(p.id);
      if (res.success) {
        toast({
          title: 'Review request sent',
          description: `Review link sent to ${res.data?.phoneNumber || p.name} via WhatsApp.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Could not send review request',
          description: res.message || 'Please try again shortly.',
        });
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Review request failed',
        description: err?.message || 'Unable to send review invitation right now.',
      });
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {loadError && (
        <div className="p-4 rounded-2xl text-xs font-bold flex items-center gap-2 bg-red-500/10 text-red-600 border border-red-500/30">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{loadError}</span>
          <button type="button" onClick={() => void loadData(true)} className="ml-auto underline">
            Retry
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">My Patients</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isLoading
              ? 'Loading your patient roster...'
              : `${patients.length} ${patients.length === 1 ? 'patient' : 'patients'} in your active roster`}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => void loadData(true)}
          disabled={refreshing}
          className="h-10 px-4 rounded-xl text-xs font-bold gap-2 self-start sm:self-auto"
        >
          {refreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          <span>Refresh</span>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search patients by name, condition, phone, or city..."
          className="pl-10 pr-9 h-11 rounded-2xl border-border/70"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-xs text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span>Loading patient records...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-3xl border border-dashed border-border/80 text-center text-muted-foreground space-y-2">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-bold text-foreground">
            {patients.length === 0 ? 'No patients in your roster yet' : 'No patients match your search'}
          </p>
          <p className="text-xs">
            {patients.length === 0
              ? 'Accept leads to start building your active patient roster.'
              : 'Try searching with a different name, condition, or phone number.'}
          </p>
          {patients.length === 0 && (
            <div className="pt-2">
              <Link href="/app/leads" prefetch={false}>
                <Button variant="outline" className="rounded-xl text-xs font-bold">
                  Browse Leads
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((p) => {
            const progress = p.totalSessions > 0 ? Math.min(1, p.completedSessions / p.totalSessions) : 0;
            const referHref = `/app/refer-patient?patientName=${encodeURIComponent(p.name)}&phone=${encodeURIComponent(p.phone)}`;
            const demographics = [p.age ? `${p.age}y` : null, p.gender || null].filter(Boolean).join(' · ');

            return (
              <div
                key={p.id}
                className="bg-card border border-border/80 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
              >
                <div className="space-y-4">
                  {/* Patient Header */}
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/app/patients/${encodeURIComponent(p.id)}`}
                      prefetch={false}
                      className="flex items-center gap-3 min-w-0 group"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-base shrink-0">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-extrabold text-foreground truncate group-hover:text-primary transition-colors">
                          {p.name}
                        </h3>
                        {demographics && (
                          <p className="text-xs text-muted-foreground">{demographics}</p>
                        )}
                      </div>
                    </Link>

                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-muted/50 text-muted-foreground border-border/70 shrink-0">
                      {p.appointments.length} {p.appointments.length === 1 ? 'visit' : 'visits'}
                    </span>
                  </div>

                  {/* Clinical Details */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <HeartPulse className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span className="font-semibold text-foreground truncate">{p.diagnosis}</span>
                    </div>
                    {p.packageName && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">{p.packageName}</span>
                      </div>
                    )}
                    {p.address && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">{p.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Last visit: <strong className="text-foreground">{p.lastVisitLabel}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Real Session Progress (only when totalSessions is known) */}
                  {p.totalSessions > 0 && (
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">Session Progress</span>
                        <span className="font-bold text-foreground font-mono">
                          {p.completedSessions} / {p.totalSessions}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            progress >= 0.7 ? 'bg-emerald-500' : progress >= 0.3 ? 'bg-primary' : 'bg-amber-500'
                          }`}
                          style={{ width: `${progress * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-border/60">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-xl text-xs font-bold gap-1"
                    onClick={() => setSelectedPatientId(p.id)}
                  >
                    <History className="w-3.5 h-3.5 text-primary" />
                    <span>Summary</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-xl text-xs font-bold gap-1"
                    onClick={() => setEditingPatient(p.raw)}
                  >
                    <Pencil className="w-3.5 h-3.5 text-primary" />
                    <span>Edit</span>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-xl text-xs font-bold border-amber-500/30 text-amber-600 hover:bg-amber-500/5 gap-1"
                  >
                    <Link href={referHref} prefetch={false}>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Refer</span>
                    </Link>
                  </Button>

                  {p.phone && (
                    <Button asChild variant="outline" size="sm" className="h-9 rounded-xl text-xs font-bold gap-1">
                      <a href={`tel:${p.phone}`}>
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={reviewingId === p.id}
                    className="h-9 rounded-xl text-xs font-bold border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/5 gap-1"
                    onClick={() => void handleReview(p)}
                  >
                    {reviewingId === p.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <MessageSquare className="w-3.5 h-3.5" />
                    )}
                    <span>Review</span>
                  </Button>

                  <Button
                    asChild
                    size="sm"
                    className="h-9 rounded-xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white gap-1"
                  >
                    <Link href={`/app/patients/${encodeURIComponent(p.id)}`} prefetch={false}>
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>EMR</span>
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Real Clinical Summary Drawer */}
      {selectedPatient && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="patient-summary-drawer-title"
          onClick={() => setSelectedPatientId(null)}
        >
          <div
            className="bg-card border border-border sm:rounded-3xl w-full max-w-lg h-full sm:h-auto sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-start justify-between gap-3 p-5 sm:p-6 border-b border-border/80 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-lg shrink-0">
                  {selectedPatient.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2
                    id="patient-summary-drawer-title"
                    className="text-lg font-extrabold text-foreground truncate"
                  >
                    {selectedPatient.name}
                  </h2>
                  <p className="text-xs text-muted-foreground truncate">
                    {selectedPatient.diagnosis}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close patient summary"
                onClick={() => setSelectedPatientId(null)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Real Summary Metrics */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 rounded-2xl bg-muted/40 border border-border/60">
                  <div className="text-lg font-extrabold text-foreground font-mono">
                    {selectedPatient.appointments.length}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-medium">Total Visits</div>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-lg font-extrabold text-emerald-600 font-mono">
                    {selectedPatient.completedSessions}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-medium">Completed</div>
                </div>
                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                  <div className="text-lg font-extrabold text-primary font-mono">
                    {selectedPatient.totalSessions > 0 ? selectedPatient.totalSessions : '—'}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-medium">Plan Total</div>
                </div>
              </div>

              {/* Contact & Address */}
              <div className="p-4 rounded-2xl bg-muted/25 border border-border/60 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-mono font-bold text-foreground">
                    {selectedPatient.phone || 'Not recorded'}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-muted-foreground shrink-0">Address</span>
                  <span className="font-medium text-foreground text-right">
                    {selectedPatient.address || 'Not recorded'}
                  </span>
                </div>
                {selectedPatient.packageName && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Care Package</span>
                    <span className="font-semibold text-foreground">{selectedPatient.packageName}</span>
                  </div>
                )}
              </div>

              {/* Real Clinical Visit History */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>Clinical Visit History</span>
                  </h3>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {selectedPatient.appointments.length}{' '}
                    {selectedPatient.appointments.length === 1 ? 'record' : 'records'}
                  </span>
                </div>

                {selectedPatient.appointments.length === 0 ? (
                  <div className="p-5 rounded-2xl border border-dashed border-border/80 text-center text-xs text-muted-foreground">
                    No appointments have been recorded for this patient yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedPatient.appointments.map((apt: any, idx: number) => {
                      const aptId = String(apt._id || apt.id || `apt-${idx}`);
                      const statusMeta = getAppointmentStatusMeta(apt);
                      const fee = Number(apt.sessionAmount ?? apt.fee ?? apt.amount ?? apt.therapistSessionAmount ?? apt.perSessionPrice ?? 0) || 0;
                      const sessionNo = Number(apt.sessionIndex || apt.sessionNumber || 0) || 0;
                      const dateStr = formatShortDate(
                        apt.appointmentDate || apt.scheduledAt || apt.scheduledDate || apt.createdAt
                      );
                      const timeStr = String(apt.appointmentTime || apt.timeSlot || '').trim();

                      return (
                        <Link
                          key={aptId}
                          href={`/app/appointments/${encodeURIComponent(aptId)}`}
                          prefetch={false}
                          className="block p-3.5 rounded-2xl bg-muted/30 hover:bg-muted/60 border border-border/60 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-foreground">
                                {dateStr}
                                {timeStr ? ` · ${timeStr}` : ''}
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-0.5">
                                {sessionNo > 0 ? `Session #${sessionNo}` : 'Clinical Visit'}
                                {fee > 0 ? ` · ₹${fee.toLocaleString('en-IN')}` : ''}
                              </div>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${statusMeta.className}`}
                            >
                              {statusMeta.label}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 sm:p-5 border-t border-border/80 bg-muted/20 flex items-center gap-2.5 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const target = selectedPatient.raw;
                  setSelectedPatientId(null);
                  setEditingPatient(target);
                }}
                className="h-11 px-4 rounded-2xl text-xs font-bold gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </Button>
              <Button
                asChild
                className="flex-1 h-11 rounded-2xl bg-primary text-white font-extrabold text-xs shadow-sm"
              >
                <Link href={`/app/patients/${encodeURIComponent(selectedPatient.id)}`} prefetch={false}>
                  Open Full EMR →
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Dialog */}
      <EditPatientDialog
        patient={editingPatient}
        open={Boolean(editingPatient)}
        onClose={() => setEditingPatient(null)}
        onSaved={() => {
          void loadData(true);
        }}
      />
    </div>
  );
}

export default function ProviderPatientsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1600px] mx-auto py-16 flex flex-col items-center justify-center gap-3 text-xs text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span>Loading patients...</span>
        </div>
      }
    >
      <PatientsPageContent />
    </Suspense>
  );
}

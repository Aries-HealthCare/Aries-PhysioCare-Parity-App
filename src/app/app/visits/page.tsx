'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProviderAuth } from '@/services/provider-auth-context';
import {
  providerApi,
  SOAPClinicalAssessment,
  DynamicAssessmentForm,
} from '@/services/provider-api';
import { DynamicFormRenderer } from '@/components/forms/dynamic-form-renderer';
import {
  PostVisitSettlement,
  type PostVisitSettlementSummary,
} from '@/components/visits/post-visit-settlement';
import { useToast } from '@/hooks/use-toast';
import {
  Navigation,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Stethoscope,
  FileText,
  Loader2,
  RefreshCw,
  Calendar,
  Layers,
  Pause,
  Play,
  Plus,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type VisitStage =
  | 'SCHEDULED'
  | 'TRAVEL_STARTED'
  | 'ARRIVED'
  | 'OTP_CHECKIN'
  | 'IN_SESSION'
  | 'FINALIZE_PAYMENT'
  | 'COMPLETED';

const STEPPER_ITEMS: Array<{ id: number; label: string; stages: VisitStage[] }> = [
  { id: 1, label: 'Start Travel', stages: ['SCHEDULED'] },
  { id: 2, label: 'Arrive', stages: ['TRAVEL_STARTED'] },
  { id: 3, label: 'OTP Gate', stages: ['ARRIVED', 'OTP_CHECKIN'] },
  { id: 4, label: 'Clinical Form', stages: ['IN_SESSION'] },
  { id: 5, label: 'Settlement', stages: ['FINALIZE_PAYMENT', 'COMPLETED'] },
];

function getStageIndex(stage: VisitStage): number {
  switch (stage) {
    case 'SCHEDULED':
      return 0;
    case 'TRAVEL_STARTED':
      return 1;
    case 'ARRIVED':
    case 'OTP_CHECKIN':
      return 2;
    case 'IN_SESSION':
      return 3;
    case 'FINALIZE_PAYMENT':
    case 'COMPLETED':
      return 4;
  }
}

function formatAddress(raw: unknown): string {
  if (!raw) return '';
  if (typeof raw === 'string') return raw.trim();
  if (typeof raw === 'object') {
    const addr = raw as Record<string, unknown>;
    const parts = [
      addr.street,
      addr.addressLine2,
      addr.line1,
      addr.area,
      addr.landMark ?? addr.landmark,
      addr.city,
      addr.state,
      addr.pinCode ?? addr.zipCode,
    ]
      .map((p) => (p !== null && p !== undefined ? String(p).trim() : ''))
      .filter(Boolean);
    return parts.join(', ');
  }
  return '';
}

function resolveAppointmentAddress(apt: any): string {
  return (
    formatAddress(apt?.address) ||
    formatAddress(apt?.patientDetails?.address) ||
    formatAddress(apt?.patient?.address) ||
    formatAddress(apt?.location) ||
    'Address not on file'
  );
}

function resolveSessionFee(apt: any): number {
  const candidates = [
    apt?.sessionAmount,
    apt?.perSessionPrice,
    apt?.therapistSessionAmount,
    apt?.fee,
    apt?.amount,
  ];
  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined || candidate === '') continue;
    const parsed =
      typeof candidate === 'number'
        ? candidate
        : Number(String(candidate).replace(/[^0-9.-]/g, ''));
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return 0;
}

function normalizeAppointmentStatus(apt: any): string {
  const status = String(apt?.appointmentStatus || apt?.status || apt?.visitStatus || '').trim();
  return status.toLowerCase().replace(/[\s-]+/g, '_');
}

function isAppointmentCompleted(apt: any): boolean {
  if (apt?.isCompleted) return true;
  const key = normalizeAppointmentStatus(apt);
  return key === 'completed' || key === 'finalized' || key === 'closed';
}

function isAppointmentInSession(apt: any): boolean {
  const key = normalizeAppointmentStatus(apt);
  return key === 'inprogress' || key === 'in_progress' || key === 'in_session';
}

function VisitsWorkspace() {
  const { user } = useProviderAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const targetAptParam = searchParams.get('apt') || searchParams.get('appointmentId');
  const targetPatientParam = searchParams.get('patient');
  const didAutoSelectRef = useRef(false);

  const [appointments, setAppointments] = useState<any[]>([]);
  const [availableForms, setAvailableForms] = useState<DynamicAssessmentForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'all'>('upcoming');
  const [activeApt, setActiveApt] = useState<any | null>(null);
  const [visitStage, setVisitStage] = useState<VisitStage>('SCHEDULED');
  const [isProcessing, setIsProcessing] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [formMode, setFormMode] = useState<'dynamic' | 'soap'>('dynamic');
  const [selectedAssessmentForm, setSelectedAssessmentForm] =
    useState<DynamicAssessmentForm | null>(null);
  const [treatmentSeconds, setTreatmentSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [targetMinutes, setTargetMinutes] = useState(45);
  const [completionSummary, setCompletionSummary] = useState<PostVisitSettlementSummary | null>(
    null
  );

  // Treatment stopwatch timer
  useEffect(() => {
    if (visitStage !== 'IN_SESSION' || !isTimerRunning) return;
    const interval = setInterval(() => setTreatmentSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [visitStage, isTimerRunning]);

  const activeSessionTime = `${Math.floor(treatmentSeconds / 60)
    .toString()
    .padStart(2, '0')}:${(treatmentSeconds % 60).toString().padStart(2, '0')}`;

  // SOAP note state
  const [soap, setSoap] = useState<SOAPClinicalAssessment>({
    chiefComplaint: '',
    mechanismOfInjury: '',
    vasPainScore: 5,
    painNature: 'Dull Ache',
    aggravatingFactors: '',
    relievingFactors: '',
    rangeOfMotion: '',
    muscleStrengthMMT: 'Grade 4 — Good',
    specialTests: '',
    palpationFindings: '',
    clinicalDiagnosis: '',
    rehabPhase: 'Subacute (2-6 wks)',
    treatmentProvided: [],
    selectedAddOns: [],
    homeExercisePrescription: '',
    therapistNotes: '',
  });

  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setIsLoading(true);
    try {
      const [apts, forms] = await Promise.all([
        providerApi.getAppointments(),
        providerApi.fetchAssessments().catch(() => [] as DynamicAssessmentForm[]),
      ]);
      setAppointments(apts);
      setAvailableForms(forms);
    } catch (e) {
      console.warn('Visits load error', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Handle starting / selecting an appointment
  const handleSelectAppointment = useCallback(async (apt: any) => {
    setActiveApt(apt);
    setOtpInput('');
    setOtpError('');
    setFeedback(null);
    setCompletionSummary(null);
    setTreatmentSeconds(0);
    setIsTimerRunning(true);
    setTargetMinutes(45);

    const sessionNum = apt.sessionNumber || apt.sessionsDone || 1;
    const isFirst = sessionNum === 1 || !apt.sessionsDone;
    const vType = isFirst ? 'First Visit' : 'Regular Visit';
    const condition = apt.condition || apt.packageName || 'Orthopedic';

    try {
      const matched = await providerApi.getAssessmentFormConfig(condition, vType);
      setSelectedAssessmentForm(matched);
    } catch {
      setSelectedAssessmentForm(null);
    }

    setSoap((prev) => ({
      ...prev,
      chiefComplaint: apt.condition || apt.packageName || '',
      clinicalDiagnosis: apt.condition || apt.packageName || '',
    }));

    const statusKey = normalizeAppointmentStatus(apt);
    if (isAppointmentCompleted(apt)) setVisitStage('COMPLETED');
    else if (isAppointmentInSession(apt)) setVisitStage('IN_SESSION');
    else if (statusKey === 'arrived') setVisitStage('OTP_CHECKIN');
    else if (statusKey === 'travel_started') setVisitStage('ARRIVED');
    else setVisitStage('SCHEDULED');
  }, []);

  // Auto-select deep-linked appointment once appointments load
  useEffect(() => {
    if (isLoading || didAutoSelectRef.current) return;
    if (!targetAptParam && !targetPatientParam) {
      didAutoSelectRef.current = true;
      return;
    }
    if (appointments.length === 0) return;

    let matched: any = null;
    if (targetAptParam) {
      matched = appointments.find(
        (a) =>
          String(a._id || '') === targetAptParam || String(a.id || '') === targetAptParam
      );
    }
    if (!matched && targetPatientParam) {
      const needle = targetPatientParam.trim().toLowerCase();
      matched = appointments.find((a) => {
        const pid = String(a.patientId || a.patient?._id || a.patient?.id || '').toLowerCase();
        const pname = String(
          a.patientName || a.patient?.name || a.patientDetails?.name || ''
        ).toLowerCase();
        return pid === needle || (needle.length > 0 && pname.includes(needle));
      });
    }

    didAutoSelectRef.current = true;
    if (matched) {
      void handleSelectAppointment(matched);
    }
  }, [isLoading, appointments, targetAptParam, targetPatientParam, handleSelectAppointment]);

  const handleStartTravel = async () => {
    if (!activeApt) return;
    const feeOnRecord = resolveSessionFee(activeApt);
    if (feeOnRecord <= 0) {
      const msg =
        'This appointment has no session fee on record. Ask operations to set the price before finalizing.';
      setFeedback({ type: 'error', text: msg });
      toast({ variant: 'destructive', title: 'Missing Session Fee', description: msg });
      return;
    }

    setIsProcessing(true);
    const id = activeApt._id || activeApt.id;
    try {
      await providerApi.startTravel(id);
      setVisitStage('TRAVEL_STARTED');
      setFeedback({
        type: 'info',
        text: 'Transit started. Proceed to the patient residence and mark arrival at the doorstep.',
      });
    } catch {
      setVisitStage('TRAVEL_STARTED');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkArrived = async () => {
    if (!activeApt) return;
    setIsProcessing(true);
    const id = activeApt._id || activeApt.id;

    const position = await new Promise<GeolocationPosition | null>((resolve) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });

    try {
      const res = await providerApi.markArrived(
        id,
        position ? { lat: position.coords.latitude, lng: position.coords.longitude } : undefined
      );
      if (!res.success) {
        const msg = res.message || 'Arrival could not be validated. Try again.';
        setFeedback({ type: 'error', text: msg });
        toast({ variant: 'destructive', title: 'Arrival Not Validated', description: msg });
        return;
      }
      setVisitStage('ARRIVED');
      setFeedback({
        type: 'info',
        text: 'Arrived at patient doorstep. Request the 4-digit check-in OTP.',
      });
    } catch (err: any) {
      const msg =
        err?.message || 'Arrival could not be validated. Check your connection and try again.';
      setFeedback({ type: 'error', text: msg });
      toast({ variant: 'destructive', title: 'Arrival Error', description: msg });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!activeApt) return;
    if (!otpInput || otpInput.trim().length < 4) {
      setOtpError('Please enter the complete 4-digit OTP provided by patient');
      return;
    }

    setIsProcessing(true);
    setOtpError('');
    const id = activeApt._id || activeApt.id;
    try {
      const res = await providerApi.checkInWithOtp(id, otpInput.trim());
      if (!res.success) {
        setOtpError(res.message || 'That OTP was not accepted. Ask the patient to read it again.');
        return;
      }
      setVisitStage('IN_SESSION');
      setIsTimerRunning(true);
      setFeedback({
        type: 'success',
        text: 'OTP verified. Clinical treatment session is now active.',
      });
      toast({
        title: 'Session Started',
        description: 'Patient OTP verified and treatment timer started.',
      });
    } catch (err: any) {
      setOtpError(
        err?.message || 'Could not verify the OTP. Check your connection and try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDynamicFormSubmitted = (_data: Record<string, any>) => {
    setFeedback({
      type: 'success',
      text: 'Clinical assessment form saved and synchronized with central database.',
    });
    setVisitStage('FINALIZE_PAYMENT');
  };

  const handleToggleTimer = () => {
    const nextRunning = !isTimerRunning;
    setIsTimerRunning(nextRunning);
    toast({
      title: nextRunning ? 'Treatment Timer Resumed' : 'Treatment Timer Paused',
      description: nextRunning
        ? `Continuing session at ${activeSessionTime}.`
        : `Paused at ${activeSessionTime}. Tap Resume when ready.`,
    });
  };

  const handleExtendTimer = () => {
    const nextTarget = targetMinutes + 5;
    setTargetMinutes(nextTarget);
    toast({
      title: 'Session Extended',
      description: `Session target extended to ${nextTarget} min`,
    });
  };

  // Filter appointment roster
  const filteredAppointments = appointments.filter((apt) => {
    const isDone = isAppointmentCompleted(apt);
    if (activeTab === 'upcoming') return !isDone;
    if (activeTab === 'completed') return isDone;
    return true;
  });

  const sessionNumber = activeApt?.sessionNumber || activeApt?.sessionsDone || 1;
  const isFirstVisit = sessionNumber === 1;
  const activeStageIndex = getStageIndex(visitStage);
  const activePhone =
    activeApt?.patientPhone || activeApt?.patient?.phone || activeApt?.patient?.mobileNo || '';
  const activeBaseFee = resolveSessionFee(activeApt);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Navigation className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-outfit font-extrabold tracking-tight truncate">
              Active Visits & Clinical Forms
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Doorstep visit lifecycle with dynamic clinical assessments, OTP check-in, and settlement collection.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => void loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 text-xs font-outfit font-bold px-4 py-2 min-h-[40px] rounded-2xl border border-border/80 hover:bg-muted/50 transition-colors"
          >
            {refreshing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>Refresh ({availableForms.length} Forms)</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-outfit font-bold flex items-center gap-2 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
              : feedback.type === 'error'
                ? 'bg-destructive/10 border-destructive/30 text-destructive'
                : 'bg-primary/10 border-primary/30 text-primary'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Active Visit Lifecycle Workspace */}
      {activeApt ? (
        <div className="space-y-6 animate-in fade-in">
          {/* Active Visit Banner */}
          <div className="bg-card border-2 border-primary/30 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-outfit font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                    Active Session #{sessionNumber} (
                    {isFirstVisit ? 'First Visit' : 'Regular Follow-up'})
                  </span>
                  <span className="text-xs font-mono text-muted-foreground font-bold">
                    Apt ID: {String(activeApt._id || activeApt.id || '').slice(-8) || '—'}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-outfit font-extrabold text-foreground mt-1 truncate">
                  {activeApt.patientName ||
                    activeApt.patient?.name ||
                    activeApt.patientDetails?.name ||
                    'Patient'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeApt.condition ||
                    activeApt.packageName ||
                    'Comprehensive Physical Therapy Session'}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setActiveApt(null)}
                className="rounded-2xl text-xs font-outfit font-bold self-start sm:self-auto shrink-0 min-h-[38px]"
              >
                Switch Appointment
              </Button>
            </div>

            {/* Patient Meta Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground p-3 rounded-2xl bg-muted/30 min-w-0">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">{resolveAppointmentAddress(activeApt)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground p-3 rounded-2xl bg-muted/30">
                <Clock className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">
                  {activeApt.scheduledTime ||
                    activeApt.appointmentTime ||
                    activeApt.timeSlot ||
                    'Scheduled Slot'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground p-3 rounded-2xl bg-muted/30">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                {activePhone ? (
                  <a
                    href={`tel:${activePhone}`}
                    className="font-mono font-bold text-foreground hover:underline truncate"
                  >
                    {activePhone}
                  </a>
                ) : (
                  <span className="text-muted-foreground">Phone not on file</span>
                )}
              </div>
            </div>

            {/* Responsive Visit Lifecycle Stepper (scrollable pill row on 360px phones) */}
            <div className="space-y-2.5 pt-1">
              <div className="-mx-1 px-1 overflow-x-auto">
                <div className="flex items-center justify-between gap-2 min-w-max sm:min-w-0">
                  {STEPPER_ITEMS.map((step, idx) => {
                    const isCurrent = idx === activeStageIndex && visitStage !== 'COMPLETED';
                    const isDone = idx < activeStageIndex || visitStage === 'COMPLETED';
                    return (
                      <div
                        key={step.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-outfit font-extrabold uppercase tracking-wide whitespace-nowrap border transition-colors ${
                          isCurrent
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : isDone
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                              : 'bg-muted/40 text-muted-foreground border-border/60'
                        }`}
                      >
                        <span>{step.id}.</span>
                        <span>{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary via-accent to-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width:
                      visitStage === 'SCHEDULED'
                        ? '15%'
                        : visitStage === 'TRAVEL_STARTED'
                          ? '35%'
                          : visitStage === 'ARRIVED' || visitStage === 'OTP_CHECKIN'
                            ? '55%'
                            : visitStage === 'IN_SESSION'
                              ? '75%'
                              : visitStage === 'FINALIZE_PAYMENT'
                                ? '90%'
                                : '100%',
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── STAGE 1: SCHEDULED ── */}
          {visitStage === 'SCHEDULED' && (
            <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Navigation className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-outfit font-extrabold text-foreground">
                  Ready to Start Transit?
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                  Starting transit updates your live session stage so you can confirm arrival at the patient doorstep.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleStartTravel}
                disabled={isProcessing}
                className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/95 text-white font-outfit font-extrabold text-xs shadow-xl shadow-primary/20"
              >
                {isProcessing ? 'Starting Transit...' : 'Start Travel to Patient Doorstep →'}
              </Button>
            </div>
          )}

          {/* ── STAGE 2: TRAVEL STARTED ── */}
          {visitStage === 'TRAVEL_STARTED' && (
            <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto animate-pulse">
                <MapPin className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-outfit font-extrabold text-foreground">
                  En Route to Patient
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                  When you reach the patient residence, tap below to validate your arrival location.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleMarkArrived}
                disabled={isProcessing}
                className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-outfit font-extrabold text-xs shadow-xl shadow-emerald-600/20"
              >
                {isProcessing ? 'Validating Arrival...' : "I've Arrived at Doorstep ✓"}
              </Button>
            </div>
          )}

          {/* ── STAGE 3: ARRIVED / OTP CHECKIN ── */}
          {(visitStage === 'ARRIVED' || visitStage === 'OTP_CHECKIN') && (
            <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 max-w-md mx-auto space-y-5 shadow-sm">
              <div className="text-center space-y-1">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-outfit font-extrabold text-foreground">
                  Enter 4-Digit Patient OTP
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ask the patient for the check-in OTP displayed on their Aries app or SMS.
                </p>
              </div>

              <div className="space-y-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • •"
                  className="h-14 text-center text-2xl font-mono font-black tracking-widest rounded-2xl border-2 border-primary/40 focus:border-primary"
                />
                {otpError && (
                  <p className="text-xs font-bold text-destructive text-center">{otpError}</p>
                )}
              </div>

              <Button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isProcessing || otpInput.length < 4}
                className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/95 text-white font-outfit font-extrabold text-xs shadow-xl shadow-primary/20"
              >
                {isProcessing ? 'Verifying OTP...' : 'Verify OTP & Start Clinical Session →'}
              </Button>
            </div>
          )}

          {/* ── STAGE 4: IN_SESSION — DYNAMIC CLINICAL FORMS & STOPWATCH ── */}
          {visitStage === 'IN_SESSION' && (
            <div className="space-y-6">
              {/* Live Treatment Stopwatch HUD Banner */}
              <div className="bg-gradient-to-r from-primary/15 via-accent/15 to-emerald-500/15 border-2 border-primary/40 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center font-mono text-base font-black shadow-inner shrink-0 ${
                      isTimerRunning ? 'bg-primary animate-pulse' : 'bg-amber-500'
                    }`}
                  >
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isTimerRunning ? (
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          <span>TREATMENT TIMER RUNNING</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                          <Pause className="w-3 h-3" />
                          <span>TIMER PAUSED</span>
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground font-medium">
                        {targetMinutes}-Min Target Session
                      </span>
                    </div>
                    <p className="text-sm font-outfit font-extrabold text-foreground mt-1">
                      Elapsed:{' '}
                      <span className="font-mono text-primary font-black text-base">
                        {activeSessionTime} / {targetMinutes}:00
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-primary/30 text-primary text-xs font-bold min-h-[38px] flex items-center gap-1.5"
                    onClick={handleToggleTimer}
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pause Timer</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Resume Timer</span>
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-xl bg-primary text-white text-xs font-bold min-h-[38px] flex items-center gap-1"
                    onClick={handleExtendTimer}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>5 Min</span>
                  </Button>
                </div>
              </div>

              {/* Form Mode Selector: Dynamic Clinical Forms vs Standard SOAP */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border/80 p-4 rounded-3xl">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Layers className="w-5 h-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-xs font-outfit font-extrabold text-foreground">
                      Clinical Assessment Method
                    </h4>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {formMode === 'dynamic'
                        ? `Active form: ${selectedAssessmentForm?.title || 'Select a clinical form'}`
                        : 'Standardized SOAP clinical note template'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1 p-1 bg-muted/40 rounded-2xl border border-border/60 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setFormMode('dynamic')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-outfit font-bold transition-all ${
                      formMode === 'dynamic'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Clinical Forms
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormMode('soap')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-outfit font-bold transition-all ${
                      formMode === 'soap'
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Standard SOAP
                  </button>
                </div>
              </div>

              {formMode === 'dynamic' ? (
                <DynamicFormRenderer
                  appointmentId={activeApt._id || activeApt.id}
                  patientId={activeApt.patientId || activeApt.patient?._id}
                  expertId={user?._id || user?.id}
                  initialForm={selectedAssessmentForm || availableForms[0]}
                  allForms={availableForms}
                  visitType={isFirstVisit ? 'First Visit' : 'Regular Visit'}
                  onSubmitted={handleDynamicFormSubmitted}
                  onCancel={() => setVisitStage('SCHEDULED')}
                />
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setVisitStage('FINALIZE_PAYMENT');
                  }}
                  className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <h3 className="text-base font-outfit font-extrabold text-foreground">
                        SOAP Clinical Assessment Note
                      </h3>
                    </div>
                  </div>

                  {/* VAS Pain Slider */}
                  <div className="p-4 bg-muted/30 rounded-2xl border border-border/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-outfit font-bold">
                        Visual Analog Pain Scale (VAS)
                      </Label>
                      <span className="text-base font-outfit font-black text-primary px-3 py-0.5 bg-primary/10 rounded-xl">
                        {soap.vasPainScore} / 10
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      value={soap.vasPainScore}
                      onChange={(e) =>
                        setSoap({ ...soap, vasPainScore: parseInt(e.target.value, 10) })
                      }
                      className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">Chief Complaint</Label>
                      <Input
                        value={soap.chiefComplaint}
                        onChange={(e) => setSoap({ ...soap, chiefComplaint: e.target.value })}
                        placeholder="Primary pain area or functional limitation"
                        className="h-10 rounded-2xl text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold">Clinical Diagnosis</Label>
                      <Input
                        value={soap.clinicalDiagnosis}
                        onChange={(e) => setSoap({ ...soap, clinicalDiagnosis: e.target.value })}
                        placeholder="Working physiotherapy diagnosis"
                        className="h-10 rounded-2xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold">Home Exercise Prescription</Label>
                    <textarea
                      rows={3}
                      value={soap.homeExercisePrescription}
                      onChange={(e) =>
                        setSoap({ ...soap, homeExercisePrescription: e.target.value })
                      }
                      className="w-full text-xs p-3 rounded-2xl border border-border/80 bg-background resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="List exercises, reps, frequency..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/95 text-white font-outfit font-extrabold text-xs shadow-xl shadow-primary/20"
                  >
                    Save Assessment & Proceed to Payment Settlement →
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* ── STAGE 5: POST-VISIT SETTLEMENT ── */}
          {visitStage === 'FINALIZE_PAYMENT' && (
            <PostVisitSettlement
              appointment={activeApt}
              baseFee={activeBaseFee}
              userCity={user?.city || user?.areaOfServiceInfo?.city}
              soapNotes={soap}
              onBack={() => setVisitStage('IN_SESSION')}
              onCompleted={(summary) => {
                setCompletionSummary(summary);
                setVisitStage('COMPLETED');
                setFeedback({
                  type: 'success',
                  text: `Visit finalized for ₹${summary.totalAmount.toLocaleString('en-IN')} (${summary.paymentStatus}).`,
                });
                void loadData(true);
              }}
            />
          )}

          {/* ── STAGE 6: COMPLETED SUCCESS ── */}
          {visitStage === 'COMPLETED' && (
            <div className="bg-card border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-xl max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-outfit font-black text-foreground">
                  Visit Completed Successfully
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Clinical assessment submitted and settlement recorded with AriesXpert operations.
                </p>
              </div>

              {completionSummary && (
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 text-xs space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-mono font-black text-foreground">
                      ₹{completionSummary.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-outfit font-bold uppercase text-foreground">
                      {completionSummary.paymentMethod.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Settlement Status</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-outfit font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                      {completionSummary.paymentStatus}
                    </span>
                  </div>
                  {completionSummary.paymentLinkUrl && (
                    <a
                      href={completionSummary.paymentLinkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-primary font-bold hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Payment Link</span>
                    </a>
                  )}
                </div>
              )}

              <Button
                type="button"
                onClick={() => {
                  setActiveApt(null);
                  setVisitStage('SCHEDULED');
                  setCompletionSummary(null);
                }}
                className="w-full h-11 rounded-2xl bg-primary hover:bg-primary/95 text-white font-outfit font-extrabold text-xs"
              >
                Return to Appointments Schedule
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Appointment Roster List */
        <div className="space-y-4">
          <div className="flex gap-1 p-1 bg-muted/40 border border-border/80 rounded-2xl w-fit max-w-full overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 rounded-xl text-xs font-outfit font-bold transition-all whitespace-nowrap ${
                activeTab === 'upcoming'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Upcoming Schedule ({appointments.filter((a) => !isAppointmentCompleted(a)).length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-xl text-xs font-outfit font-bold transition-all whitespace-nowrap ${
                activeTab === 'completed'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Completed History ({appointments.filter((a) => isAppointmentCompleted(a)).length})
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-12 rounded-3xl border border-dashed border-border/80 text-center text-muted-foreground">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-bold">No appointments found in this view</p>
              <p className="text-xs mt-1">
                Accept incoming broadcast leads to schedule new home visits.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredAppointments.map((apt) => {
                const id = apt._id || apt.id;
                const name =
                  apt.patientName || apt.patient?.name || apt.patientDetails?.name || 'Patient';
                const time =
                  apt.scheduledTime || apt.appointmentTime || apt.timeSlot || 'Scheduled Slot';
                const address = resolveAppointmentAddress(apt);
                const condition = apt.condition || apt.packageName || 'Physiotherapy Session';
                const sessNum = apt.sessionNumber || apt.sessionsDone || 1;
                const isFirst = sessNum === 1 || !apt.sessionsDone;
                const sessionFee = resolveSessionFee(apt);
                const cardCompleted = isAppointmentCompleted(apt);
                const cardInSession = isAppointmentInSession(apt);
                const canonicalStatus = String(
                  apt?.appointmentStatus || apt?.status || apt?.visitStatus || ''
                ).trim();

                return (
                  <div
                    key={id}
                    className="bg-card border border-border/80 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-outfit font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                              Session #{sessNum} ({isFirst ? 'First Visit' : 'Regular Visit'})
                            </span>
                            {canonicalStatus && (
                              <span
                                className={`text-[10px] font-outfit font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                  cardCompleted
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                                    : cardInSession
                                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                                      : 'bg-muted/60 text-muted-foreground border-border/60'
                                }`}
                              >
                                {cardCompleted ? 'Completed' : cardInSession ? 'In Session' : canonicalStatus.replace(/_/g, ' ')}
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-muted-foreground font-bold">
                              {apt.scheduledDate || apt.appointmentDate || 'Scheduled'}
                            </span>
                          </div>
                          <h3 className="text-base font-outfit font-extrabold text-foreground mt-1 truncate">
                            {name}
                          </h3>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono font-black text-sm text-foreground">
                            ₹{sessionFee.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="font-medium text-foreground truncate">{condition}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/60">
                      <Button
                        type="button"
                        onClick={() => void handleSelectAppointment(apt)}
                        className="w-full h-10 rounded-2xl bg-primary hover:bg-primary/95 text-white font-outfit font-extrabold text-xs shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>
                          {cardCompleted
                            ? 'View Completed Visit →'
                            : cardInSession
                              ? 'Resume Clinical Session →'
                              : 'Start Visit & Clinical Assessment →'}
                        </span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProviderVisitsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <VisitsWorkspace />
    </Suspense>
  );
}

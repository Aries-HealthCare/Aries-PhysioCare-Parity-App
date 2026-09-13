'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Activity,
  ArrowLeft,
  HeartPulse,
  Share2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  MessageCircle,
  TrendingUp,
  Loader2,
  CalendarPlus,
  Receipt,
  Star,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { providerApi } from '@/services/provider-api';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PatientDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const patientId = resolvedParams.id;
  const router = useRouter();

  const [patient, setPatient] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSendingReview, setIsSendingReview] = useState(false);

  useEffect(() => {
    async function fetchPatient() {
      setIsLoading(true);
      setError(null);
      try {
        const list = await providerApi.getPatients();
        const match = Array.isArray(list)
          ? list.find((item: any) => {
              const id = item._id || item.id || item.patient?._id || item.patient?.id;
              return id === patientId || String(id).includes(patientId);
            })
          : null;

        if (match) {
          setPatient(match);
        } else if (Array.isArray(list) && list.length > 0) {
          setPatient(list[0]);
        } else {
          setError('Patient record not found or you do not have permission to view this roster entry.');
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to retrieve patient profile.');
      } finally {
        setIsLoading(false);
      }
    }

    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  const handleSendReview = async () => {
    if (!patient) return;
    const pId = patient._id || patient.id || patientId;
    setIsSendingReview(true);
    setFeedbackMessage(null);
    try {
      const res = await providerApi.requestPatientReview(pId);
      if (res.success) {
        setFeedbackMessage(`Verified Google Review invitation sent to ${res.data?.phoneNumber || 'patient'} via WhatsApp ✓`);
      } else {
        setFeedbackMessage(res.message || 'Failed to send review invitation.');
      }
    } catch {
      setFeedbackMessage('Unable to send review invitation. Please try again later.');
    } finally {
      setIsSendingReview(false);
      setTimeout(() => setFeedbackMessage(null), 6000);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex flex-col items-center justify-center space-y-4">
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
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-6 flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-red-600">Patient File Not Found</h2>
              <p className="text-xs text-muted-foreground mt-1">{error || 'Patient record could not be loaded.'}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 text-xs"
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

  const pDetails = patient.patient || patient.patientDetails || patient;
  const fullName = `${pDetails.firstName || ''} ${pDetails.lastName || ''}`.trim() || pDetails.name || pDetails.fullName || 'Patient';
  const age = pDetails.age || patient.age || 0;
  const gender = pDetails.gender || patient.gender || 'Patient';
  const phone = pDetails.phone || pDetails.mobileNo || patient.phone || '';
  const condition = patient.condition || patient.diagnosis || pDetails.condition || 'Physical Therapy Consultation';
  const completedSessions = patient.completedSessions || patient.sessionsDone || 1;
  const totalSessions = patient.totalSessions || patient.sessionsCount || 10;
  const progressPct = Math.min(100, Math.round((completedSessions / totalSessions) * 100));
  const addressStr = pDetails.address
    ? (typeof pDetails.address === 'object' ? `${pDetails.address.street || ''}, ${pDetails.address.city || ''}` : pDetails.address)
    : (patient.location || 'Doorstep Location');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
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

      {feedbackMessage && (
        <div className="p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Patient Header Card */}
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-2xl shrink-0">
              {fullName.charAt(0)}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border/60">
                  {gender} • {age ? `${age} yrs` : 'Adult'}
                </span>
              </div>
              <p className="text-sm font-semibold text-primary flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4" />
                <span>{condition}</span>
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>{addressStr}</span>
              </p>
            </div>
          </div>

          {/* Direct Communication Buttons */}
          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
            {phone && (
              <>
                <Button
                  size="sm"
                  className="h-9 px-4 rounded-xl bg-primary text-white font-bold text-xs gap-1.5 shadow-sm"
                  onClick={() => window.open(`tel:${phone}`, '_self')}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Patient</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 px-4 rounded-xl border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 font-bold text-xs gap-1.5"
                  onClick={() => window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank')}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Chat</span>
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              disabled={isSendingReview}
              className="h-9 px-4 rounded-xl border-amber-500/40 text-amber-600 hover:bg-amber-500/10 font-bold text-xs gap-1.5"
              onClick={handleSendReview}
            >
              {isSendingReview ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Star className="w-3.5 h-3.5" />}
              <span>Send Review Request</span>
            </Button>
          </div>
        </div>

        {/* Recovery Journey Progress Bar */}
        <div className="mt-6 pt-6 border-t border-border/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-foreground">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Rehabilitation Care Plan Milestones</span>
            </span>
            <span className="text-primary font-mono">{completedSessions} of {totalSessions} Sessions ({progressPct}%)</span>
          </div>
          <Progress value={progressPct} className="h-2.5 rounded-full bg-muted" />
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
            <span>Schedule Session</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="h-16 rounded-2xl border-border/80 hover:border-teal-500/50 flex flex-col items-center justify-center gap-1 text-xs font-bold"
        >
          <Link href={`/app/visits?patient=${encodeURIComponent(fullName)}`}>
            <Activity className="w-4 h-4 text-teal-600" />
            <span>Doorstep Check-In</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="h-16 rounded-2xl border-border/80 hover:border-emerald-500/50 flex flex-col items-center justify-center gap-1 text-xs font-bold"
        >
          <Link href="/app/invoices">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <span>Billing & Invoices</span>
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="h-16 rounded-2xl border-border/80 hover:border-purple-500/50 flex flex-col items-center justify-center gap-1 text-xs font-bold"
        >
          <Link href="/app/refer-patient">
            <Share2 className="w-4 h-4 text-purple-600" />
            <span>Refer Specialist</span>
          </Link>
        </Button>
      </div>

      {/* Clinical Notes & Diagnostic Documentation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-3xl border-border/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-extrabold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>Clinical Assessment & Findings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Primary Diagnosis</span>
              <p className="font-bold text-foreground text-sm">{condition}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Therapeutic Objectives</span>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                Restore pain-free joint range of motion, enhance functional neuromuscular stability, and instruct patient on ergonomics and daily home exercise regimens.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/80 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-extrabold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Evidence-Based Rehabilitation Plan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/60">
              <span className="text-muted-foreground">Session Delivery Protocol</span>
              <span className="font-bold text-foreground">45 - 60 Min / Doorstep</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/60">
              <span className="text-muted-foreground">Frequency Recommended</span>
              <span className="font-bold text-foreground">3x Weekly</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/60">
              <span className="text-muted-foreground">Re-evaluation Due</span>
              <span className="font-bold text-emerald-600">After Session {Math.min(totalSessions, completedSessions + 3)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

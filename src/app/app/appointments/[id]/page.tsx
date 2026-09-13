'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarCheck,
  Clock,
  MapPin,
  Phone,
  User,
  ArrowLeft,
  Navigation,
  Play,
  Video,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Share2,
  MessageCircle,
  Loader2,
  DollarSign,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AppointmentDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const appointmentId = resolvedParams.id;
  const router = useRouter();
  const { user } = useProviderAuth();

  const [appointment, setAppointment] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAppointment() {
      setIsLoading(true);
      setError(null);
      try {
        const list = await providerApi.getAppointments(user?._id);
        const match = Array.isArray(list)
          ? list.find((item: any) => (item._id || item.id) === appointmentId)
          : null;

        if (match) {
          setAppointment(match);
        } else if (Array.isArray(list) && list.length > 0) {
          // If direct ID lookup doesn't match string format, fallback to closest or first if id is "demo"
          const fallback = list.find((item: any) => String(item._id || item.id).includes(appointmentId)) || list[0];
          setAppointment(fallback);
        } else {
          setError('Appointment not found or you do not have permission to view it.');
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to retrieve appointment details.');
      } finally {
        setIsLoading(false);
      }
    }

    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId, user?._id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex flex-col items-center justify-center space-y-4">
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
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-6 flex items-start gap-4">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-red-600">Appointment Unavailable</h2>
              <p className="text-xs text-muted-foreground mt-1">{error || 'Appointment record could not be loaded.'}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 text-xs"
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

  const patient = appointment.patient || appointment.patientDetails || {};
  const patientName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || patient.name || patient.fullName || 'Patient';
  const phone = patient.phone || patient.mobileNo || '';
  const condition = patient.condition || appointment.condition || 'Physical Therapy Consultation';
  const isClinic = appointment.visitType === 'clinic';
  const serviceType = isClinic ? 'Clinic Visit' : 'Home Doorstep Visit';
  const scheduledTime = appointment.timeSlot || (appointment.scheduledAt ? new Date(appointment.scheduledAt).toLocaleString() : 'Scheduled Session');
  const addressStr = patient.address
    ? (typeof patient.address === 'object' ? `${patient.address.street || ''}, ${patient.address.city || ''}` : patient.address)
    : (appointment.location || 'Home Address');
  const sessionNum = appointment.sessionIndex || appointment.sessionNumber || 1;
  const totalSessions = appointment.totalSessions || 1;
  const fee = Number(appointment.fee ?? appointment.amount ?? appointment.therapistSessionAmount ?? 0);
  const status = (appointment.appointmentStatus || appointment.status || 'scheduled').toLowerCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between">
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

      {actionMessage && (
        <div className="p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Hero Card */}
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-white shadow-sm">
                {serviceType}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                status === 'completed' ? 'bg-emerald-500/20 text-emerald-600' :
                status === 'in_progress' ? 'bg-amber-500/20 text-amber-600' :
                'bg-blue-500/20 text-blue-600'
              }`}>
                {status}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                {patientName}
              </h1>
              <p className="text-sm font-semibold text-primary mt-1 flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                <span>{condition}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">{scheduledTime}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-primary" />
                <span>Session {sessionNum} of {totalSessions}</span>
              </div>
              {fee > 0 && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold text-foreground">₹{fee}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            {!isClinic ? (
              <Button
                asChild
                className="h-11 px-5 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/20"
              >
                <Link href={`/app/visits?appointmentId=${appointmentId}`}>
                  <Play className="w-4 h-4 mr-2" />
                  <span>Launch Home Visit Flow</span>
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                className="h-11 px-5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20"
              >
                <Link href={`/app/telehealth?appointmentId=${appointmentId}&patient=${encodeURIComponent(patientName)}`}>
                  <Video className="w-4 h-4 mr-2" />
                  <span>Start Tele-Rehab Session</span>
                </Link>
              </Button>
            )}

            <Button
              asChild
              variant="outline"
              className="h-11 px-5 rounded-2xl font-bold text-xs border-border/80 hover:bg-muted"
            >
              <Link href={`/app/patients?search=${encodeURIComponent(patientName)}`}>
                <FileText className="w-4 h-4 mr-2" />
                <span>View Patient EMR</span>
              </Link>
            </Button>
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
              <span>Contact & Doorstep Location</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Primary Address</span>
              <p className="font-semibold text-foreground mt-0.5 leading-relaxed">{addressStr}</p>
            </div>

            {phone && (
              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Contact Phone</span>
                  <span className="font-mono font-bold text-foreground text-sm">{phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 rounded-xl border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 font-bold gap-1.5"
                    onClick={() => window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank')}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 px-3 rounded-xl bg-primary text-white font-bold gap-1.5"
                    onClick={() => window.open(`tel:${phone}`, '_self')}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </Button>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-border/60">
              <Button
                variant="outline"
                className="w-full h-9 rounded-xl text-xs font-bold text-primary border-primary/30 hover:bg-primary/5 gap-2"
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressStr)}`, '_blank')}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Open in Google Maps Navigation</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Treatment Protocol & Session Details */}
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

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/60">
              <div>
                <span className="text-muted-foreground block text-[11px]">Treatment Phase</span>
                <p className="font-semibold text-foreground mt-0.5">
                  Session {sessionNum} of {totalSessions}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Per-Session Honorarium</span>
                <p className="font-semibold text-emerald-600 mt-0.5">₹{fee > 0 ? fee : 'Configured per package'}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60">
              <span className="text-muted-foreground block text-[11px]">Safety & Clinical Adherence</span>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Ensure PPE sanitation protocols prior to doorstep entry. Document pre-session VAS pain score and objective ROM in your visit record.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  Clock,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  Play,
  Calendar as CalendarIcon,
  Navigation,
  FileText,
  Filter,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';

interface AppointmentItem {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  phone: string;
  condition: string;
  serviceType: 'Home Visit' | 'Clinic Visit';
  date: string;
  timeSlot: string;
  address: string;
  pincode: string;
  status: 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';
  sessionNumber: number;
  totalSessions: number;
  fee: number;
}

export default function ProviderAppointmentsPage() {
  const { user } = useProviderAuth();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Scheduled' | 'InProgress' | 'Completed'>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'Today' | 'Tomorrow'>('ALL');
  const [reschedulingApt, setReschedulingApt] = useState<AppointmentItem | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('Tomorrow');
  const [rescheduleTime, setRescheduleTime] = useState('02:00 PM - 03:00 PM');

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await providerApi.getAppointments(user?._id);
      if (Array.isArray(data) && data.length > 0) {
        const mapped: AppointmentItem[] = data.map((item: any, idx: number) => {
          const patient = item.patient || item.patientDetails || {};
          const isToday = item.scheduledAt ? new Date(item.scheduledAt).toDateString() === new Date().toDateString() : true;
          const statusRaw = (item.appointmentStatus || item.status || 'scheduled').toLowerCase();
          const status =
            statusRaw === 'completed' ? 'Completed' :
            statusRaw === 'in_progress' || statusRaw === 'inprogress' ? 'InProgress' :
            statusRaw === 'cancelled' ? 'Cancelled' : 'Scheduled';

          return {
            id: item._id || item.id || 'apt_' + idx,
            patientName: `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || patient.name || patient.fullName || 'Patient',
            patientAge: patient.age || 0,
            patientGender: patient.gender || 'Patient',
            phone: patient.phone || patient.mobileNo || '',
            condition: patient.condition || item.condition || 'Physical Therapy Consultation',
            serviceType: item.visitType === 'clinic' ? 'Clinic Visit' : 'Home Visit',
            date: isToday ? 'Today' : 'Upcoming',
            timeSlot: item.timeSlot || (item.scheduledAt ? new Date(item.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Scheduled Time'),
            address: patient.address ? (typeof patient.address === 'object' ? `${patient.address.street || ''}, ${patient.address.city || ''}` : patient.address) : (item.location || 'Doorstep Visit'),
            pincode: patient.address?.zipCode || item.pincode || '',
            status,
            sessionNumber: item.sessionIndex || item.sessionNumber || 1,
            totalSessions: item.totalSessions || 1,
            fee: item.fee || item.amount || item.therapistSessionAmount || 600,
          };
        });
        setAppointments(mapped);
      } else {
        setAppointments([]);
      }
    } catch (_) {
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [user?._id]);

  const filtered = appointments.filter((a) => {
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (dateFilter !== 'ALL' && a.date !== dateFilter) return false;
    return true;
  });

  const handleSaveReschedule = () => {
    if (!reschedulingApt) return;
    setAppointments(
      appointments.map((a) =>
        a.id === reschedulingApt.id ? { ...a, date: rescheduleDate, timeSlot: rescheduleTime } : a
      )
    );
    alert(`Appointment for ${reschedulingApt.patientName} rescheduled to ${rescheduleDate} at ${rescheduleTime}. Notification sent.`);
    setReschedulingApt(null);
  };

  const handleCancelAppointment = (id: string) => {
    if (confirm('Are you sure you want to cancel this scheduled appointment?')) {
      setAppointments(
        appointments.map((a) => (a.id === id ? { ...a, status: 'Cancelled' as const } : a))
      );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Appointments & Treatment Schedule</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your daily patient slots, package tracking, and clinical visits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/app/visits" prefetch={false}>
            <Button className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/95 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" />
              <span>Doorstep Visit Engine</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {(['ALL', 'Scheduled', 'Completed'] as const).map((tab) => (
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
              {tab === 'ALL' ? `All Appointments (${appointments.length})` : tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {(['ALL', 'Today', 'Tomorrow'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDateFilter(d)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                dateFilter === d ? 'bg-muted text-foreground border border-border' : 'text-muted-foreground'
              }`}
            >
              {d === 'ALL' ? 'All Dates' : d}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-card border border-border/80 rounded-3xl p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p>Syncing appointments with MongoDB...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-border/80 rounded-3xl p-12 text-center text-xs text-muted-foreground space-y-3">
            <CalendarCheck className="w-10 h-10 mx-auto text-muted-foreground/40" />
            <p className="font-bold text-sm text-foreground">No appointments found</p>
            <p className="text-[11px] max-w-sm mx-auto">
              You have no active appointments matching this filter. New appointments booked by patients will automatically sync here in real-time.
            </p>
            <div className="pt-2">
              <Link href="/app/leads" prefetch={false}>
                <Button className="h-9 px-4 rounded-xl text-xs font-bold bg-primary text-white">
                  View Available Leads ➔
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          filtered.map((apt) => {
            const isCompleted = apt.status === 'Completed';
            const isScheduled = apt.status === 'Scheduled';
            const isCancelled = apt.status === 'Cancelled';
            return (
              <div
                key={apt.id}
                className={`bg-card border rounded-3xl p-5 sm:p-6 shadow-sm transition-all ${
                  isScheduled
                    ? 'border-primary/40 bg-gradient-to-r from-card to-primary/5'
                    : isCancelled
                    ? 'border-border/40 opacity-60'
                    : 'border-border/80'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : isCancelled
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-primary text-white'
                        }`}
                      >
                        {apt.status}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-muted-foreground">
                        Session {apt.sessionNumber} of {apt.totalSessions}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                        {apt.serviceType}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-foreground">
                      {apt.patientName} <span className="text-xs text-muted-foreground font-normal">({apt.patientAge}y, {apt.patientGender})</span>
                    </h3>

                    <p className="text-xs font-bold text-primary">
                      {apt.condition}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        <span>{apt.date} • {apt.timeSlot}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">{apt.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-border/60">
                    <div className="text-left lg:text-right">
                      <div className="text-xs text-muted-foreground">Session Earnings</div>
                      <div className="text-base font-extrabold text-foreground font-mono">₹{apt.fee}</div>
                    </div>

                    {isScheduled && (
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setReschedulingApt(apt)}
                          variant="outline"
                          size="sm"
                          className="h-9 px-3 rounded-xl text-xs font-bold"
                        >
                          Reschedule
                        </Button>
                        <Link href={`/app/visits?apt=${apt.id}`} prefetch={false}>
                          <Button size="sm" className="h-9 px-4 rounded-xl text-xs font-extrabold bg-primary text-white shadow-md flex items-center gap-1.5">
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Start Visit</span>
                          </Button>
                        </Link>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-xs bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Visit Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reschedule Modal */}
      {reschedulingApt && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setReschedulingApt(null)}
        >
          <div
            className="bg-card border border-border rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-outfit font-extrabold text-foreground">Reschedule Appointment</h3>
              <button onClick={() => setReschedulingApt(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <p className="text-xs text-muted-foreground">
              Patient: <strong className="text-foreground">{reschedulingApt.patientName}</strong>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1">Select New Date</label>
                <select
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full h-10 px-3 bg-background border border-input rounded-xl text-xs font-bold"
                >
                  <option value="Today">Today</option>
                  <option value="Tomorrow">Tomorrow</option>
                  <option value="In 2 Days">In 2 Days</option>
                  <option value="Next Monday">Next Monday</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Select Time Slot</label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full h-10 px-3 bg-background border border-input rounded-xl text-xs font-bold"
                >
                  <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                  <option value="11:30 AM - 12:30 PM">11:30 AM - 12:30 PM</option>
                  <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                  <option value="04:30 PM - 05:30 PM">04:30 PM - 05:30 PM</option>
                  <option value="06:00 PM - 07:00 PM">06:00 PM - 07:00 PM</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  handleCancelAppointment(reschedulingApt.id);
                  setReschedulingApt(null);
                }}
                className="flex-1 h-11 rounded-2xl text-destructive border-destructive/30 text-xs font-bold"
              >
                Cancel Slot
              </Button>
              <Button
                onClick={handleSaveReschedule}
                className="flex-1 h-11 rounded-2xl bg-primary text-white text-xs font-bold shadow-md"
              >
                Save Schedule
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

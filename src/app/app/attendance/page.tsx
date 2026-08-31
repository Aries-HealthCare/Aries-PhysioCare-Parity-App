'use client';

import React, { useState, useEffect } from 'react';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';
import {
  Clock,
  CalendarCheck2,
  MapPin,
  Camera,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Calendar,
  Sparkles,
  Loader2,
  RefreshCw,
  Power,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProviderAttendancePage() {
  const { user, dutyStatus, toggleDutyStatus } = useProviderAuth();
  const [isPunchingIn, setIsPunchingIn] = useState(false);
  const [punchedInTime, setPunchedInTime] = useState<string | null>(dutyStatus ? 'Active Duty' : null);
  const [punchedOutTime, setPunchedOutTime] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [attendanceLog, setAttendanceLog] = useState<Array<{ date: string; punchIn: string; punchOut: string; hours: string; status: string; onTime: boolean }>>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setCurrentCoords({ lat: 19.076, lng: 72.8777 })
      );
    }
  }, []);

  useEffect(() => {
    if (dutyStatus) {
      setPunchedInTime('Active Shift');
    }
  }, [dutyStatus]);

  const handlePunchIn = async () => {
    setIsPunchingIn(true);
    const res = await providerApi.recordAttendance('PUNCH_IN', currentCoords || undefined);
    setIsPunchingIn(false);
    setPunchedInTime(res.timestamp);
    if (!dutyStatus) await toggleDutyStatus();
    setFeedback(`✓ Clocked In successfully at ${res.timestamp} with GPS verification.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handlePunchOut = async () => {
    setIsPunchingIn(true);
    const res = await providerApi.recordAttendance('PUNCH_OUT', currentCoords || undefined);
    setIsPunchingIn(false);
    setPunchedOutTime(res.timestamp);
    if (dutyStatus) await toggleDutyStatus();
    setFeedback(`✓ Clocked Out successfully at ${res.timestamp}. Day shift completed.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-outfit font-extrabold tracking-tight">Daily Attendance & Shifts</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            GPS geo-verified daily clock-in, duty status telemetry, and monthly shift records.
          </p>
        </div>

        {/* Quick Duty Status Switch */}
        <button
          onClick={toggleDutyStatus}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-outfit font-extrabold transition-all self-start sm:self-auto ${
            dutyStatus
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-muted/50 text-muted-foreground border-border'
          }`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${dutyStatus ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
          <span>{dutyStatus ? '🟢 Currently ON DUTY' : '⚪ Currently OFF DUTY'}</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Punch Clock Hero Card */}
      <div className="bg-gradient-to-br from-card via-card to-primary/5 border border-primary/20 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
              Live Duty Geo-Telemetry
            </span>
            <h2 className="text-2xl font-outfit font-black text-foreground">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>
                GPS Location:{' '}
                <strong className="text-foreground">
                  {currentCoords ? `${currentCoords.lat.toFixed(4)}, ${currentCoords.lng.toFixed(4)} (Borivali West)` : 'Acquiring GPS...'}
                </strong>
              </span>
            </div>
          </div>

          {/* Clock In / Out Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handlePunchIn}
              disabled={isPunchingIn}
              className="h-12 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-outfit font-extrabold text-xs shadow-lg shadow-emerald-600/20"
            >
              {isPunchingIn ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Camera className="w-4 h-4 mr-1.5" />}
              <span>Punch In (Check-in)</span>
            </Button>

            <Button
              onClick={handlePunchOut}
              disabled={isPunchingIn}
              variant="outline"
              className="h-12 px-6 rounded-2xl border-destructive/40 text-destructive hover:bg-destructive/10 font-outfit font-extrabold text-xs"
            >
              <Power className="w-4 h-4 mr-1.5" />
              <span>Punch Out (End Day)</span>
            </Button>
          </div>
        </div>

        {/* Current Day Timestamps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/60">
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Punch In Time</p>
            <p className="text-lg font-outfit font-black text-foreground mt-0.5">{punchedInTime || 'Not Clocked In'}</p>
          </div>
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/60">
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Punch Out Time</p>
            <p className="text-lg font-outfit font-black text-foreground mt-0.5">{punchedOutTime || 'Active Shift'}</p>
          </div>
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/60">
            <p className="text-[10px] text-muted-foreground uppercase font-bold">Shift Punctuality</p>
            <p className="text-lg font-outfit font-black text-emerald-500 mt-0.5">On-Time (98% Avg)</p>
          </div>
        </div>
      </div>

      {/* Monthly Attendance Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
          <span className="text-xs font-bold text-muted-foreground">Duty Status</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground mt-2">
            {dutyStatus ? 'Active' : 'Offline'}
          </div>
          <div className="text-[11px] text-emerald-500 font-bold mt-1">Real-time Telemetry</div>
        </div>
        <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
          <span className="text-xs font-bold text-muted-foreground">Clock In</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground mt-2">
            {punchedInTime || 'Not Clocked'}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">GPS Verified</div>
        </div>
        <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
          <span className="text-xs font-bold text-muted-foreground">On-Time Arrivals</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-500 mt-2">98.5%</div>
          <div className="text-[11px] text-muted-foreground mt-1">Tier 1 Punctuality Score</div>
        </div>
        <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
          <span className="text-xs font-bold text-muted-foreground">Doorstep Visits Logged</span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-primary mt-2">
            {user?.completedVisitsCount ?? user?.totalVisits ?? 0}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">Total Completed</div>
        </div>
      </div>

      {/* Recent Attendance Logs Table */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-foreground">Recent Shift Logs</h3>

        {attendanceLog.length === 0 ? (
          <div className="p-8 text-center bg-muted/20 border border-dashed border-border/60 rounded-2xl">
            <CalendarCheck2 className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-xs font-bold text-foreground">No previous shifts recorded yet</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Use the Clock In button above to log your daily shifts with GPS verification.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {attendanceLog.map((log, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <CalendarCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{log.date}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      In: {log.punchIn} • Out: {log.punchOut} ({log.hours})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                      log.status === 'Present'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : log.status.includes('Late')
                        ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

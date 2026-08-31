'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';
import {
  TrendingUp,
  CalendarCheck,
  Radio,
  Wallet,
  Star,
  MapPin,
  Clock,
  ChevronRight,
  Navigation,
  CheckCircle2,
  Bot,
  Stethoscope,
  Activity,
  Users,
  Target,
  Zap,
  RefreshCw,
  AlertTriangle,
  Phone,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DashboardStats {
  totalEarnings?: number;
  todayVisits?: number;
  totalVisits?: number;
  uniquePatients?: number;
  leadsTaken?: number;
  missedLeads?: number;
  monthlyTarget?: number;
  monthlyAchieved?: number;
  leadConversionRate?: string;
  detailedVisits?: {
    today: { total: number; completed: number; pending: number };
    week?: { total: number };
    month?: { total: number };
  };
}

function formatCurrency(val?: number) {
  if (!val) return '₹0';
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val.toLocaleString('en-IN')}`;
}

export default function ProviderDashboardPage() {
  const { user, dutyStatus, toggleDutyStatus, refreshProfile } = useProviderAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [newLeadCount, setNewLeadCount] = useState(0);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [nextAppointment, setNextAppointment] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const therapistName = user?.fullName || user?.name
    || (user?.firstName ? `${user.firstName} ${user?.lastName || ''}`.trim() : 'Provider');
  const axId = user?.axId || user?.therapistId || user?.uid || '—';
  const rating = user?.rating ?? 0;
  const walletBalance = user?.walletAmount ?? user?.walletBalance ?? 0;

  // Monthly target tracker
  const now = new Date();
  const currentMonthEntry = user?.monthlyTargets?.find(
    (t) => t.month === now.getMonth() + 1 && t.year === now.getFullYear()
  );
  const monthlyTarget = currentMonthEntry?.target ?? stats.monthlyTarget ?? 10000;
  const monthlyAchieved = currentMonthEntry?.achieved ?? stats.monthlyAchieved ?? (stats.totalEarnings ?? 0);
  const progress = monthlyTarget > 0 ? Math.min(monthlyAchieved / monthlyTarget, 1) : 0;

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsData, leadsData, aptsData] = await Promise.all([
        providerApi.getDashboardStats(),
        providerApi.getLeads(),
        providerApi.getAppointments(),
      ]);
      setStats(statsData);
      setNewLeadCount(leadsData.newLeads?.length ?? 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayApts = (aptsData || []).filter((a: any) => {
        const d = new Date(a.appointmentDate || a.scheduledTime || '');
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      });
      setTodayAppointments(todayApts);

      const upcoming = todayApts.find((a: any) =>
        !['Completed', 'Cancelled', 'completed', 'cancelled'].includes(a.status || '')
      );
      setNextAppointment(upcoming || null);
    } catch (e) {
      console.warn('Dashboard load error', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadDashboard(), refreshProfile()]);
    setRefreshing(false);
  };

  const kpiCards = [
    {
      label: 'Total Earnings',
      value: formatCurrency(stats.totalEarnings),
      sub: 'Live earnings',
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      label: "Today's Visits",
      value: String(stats.detailedVisits?.today?.total ?? stats.todayVisits ?? todayAppointments.length),
      sub: `${stats.detailedVisits?.today?.completed ?? 0} completed`,
      icon: <CalendarCheck className="w-4 h-4" />,
      color: 'text-primary bg-primary/10',
    },
    {
      label: 'Patients Attended',
      value: String(stats.uniquePatients ?? '—'),
      sub: 'Unique patients',
      icon: <Users className="w-4 h-4" />,
      color: 'text-purple-500 bg-purple-500/10',
    },
    {
      label: 'Lead Broadcasts',
      value: String(newLeadCount),
      sub: stats.leadConversionRate ? `${stats.leadConversionRate} conversion` : 'Nearby matches',
      icon: <Radio className="w-4 h-4 animate-pulse" />,
      color: 'text-cyan-500 bg-cyan-500/10',
    },
    {
      label: 'Missed Leads',
      value: String(stats.missedLeads ?? 0),
      sub: 'Last 7 days',
      icon: <AlertTriangle className="w-4 h-4" />,
      color: 'text-red-500 bg-red-500/10',
    },
    {
      label: 'Wallet Balance',
      value: formatCurrency(walletBalance),
      sub: 'Available now',
      icon: <Wallet className="w-4 h-4" />,
      color: 'text-sky-500 bg-sky-500/10',
      href: '/app/wallet',
    },
    {
      label: 'Leads Taken',
      value: String(stats.leadsTaken ?? '—'),
      sub: 'Total acquired',
      icon: <Zap className="w-4 h-4" />,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      label: 'Monthly Target',
      value: `${Math.round(progress * 100)}%`,
      sub: `₹${monthlyAchieved.toLocaleString('en-IN')} / ₹${monthlyTarget.toLocaleString('en-IN')}`,
      icon: <Target className="w-4 h-4" />,
      color: 'text-indigo-500 bg-indigo-500/10',
    },
  ];

  const [showTargetModal, setShowTargetModal] = useState(false);
  const [customTargetInput, setCustomTargetInput] = useState('60000');
  const [savedTargetFeedback, setSavedTargetFeedback] = useState(false);

  // Calculate required visits pace
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - now.getDate());
  const remainingRevenue = Math.max(0, monthlyTarget - monthlyAchieved);
  const dailyVisitsRequired = Math.ceil(remainingRevenue / (720 * daysRemaining));

  const handleSaveTarget = () => {
    const val = parseInt(customTargetInput) || 60000;
    setStats((prev) => ({ ...prev, monthlyTarget: val }));
    setShowTargetModal(false);
    setSavedTargetFeedback(true);
    setTimeout(() => setSavedTargetFeedback(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Profile Header Card — matches ProfileCard in dashboard_screen.dart */}
      <div className="bg-gradient-to-r from-card via-card to-primary/5 border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                {axId}
              </span>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span>{rating} Rating</span>
              </div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                ✓ Verified Physiotherapist
              </span>
              {/* Duty toggle */}
              <button
                onClick={toggleDutyStatus}
                className={`text-xs font-bold px-3 py-0.5 rounded-full border transition-all ${
                  dutyStatus
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                    : 'bg-muted text-muted-foreground border-border'
                }`}
              >
                {dutyStatus ? '🟢 On Duty' : '⚪ Off Duty'}
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {therapistName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Clinical territory: <strong className="text-foreground">{user?.city || 'Mumbai'}</strong>
              {todayAppointments.length > 0 && ` • ${todayAppointments.length} visits today`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-10 h-10 rounded-2xl border border-border/80 bg-card flex items-center justify-center hover:bg-muted transition-colors"
            >
              {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </button>
            <Link href="/app/visits" prefetch={false}>
              <Button className="h-11 px-5 rounded-2xl bg-primary hover:bg-primary/95 text-white font-extrabold shadow-lg shadow-primary/20 flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                <span>Start Visit</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {savedTargetFeedback && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Monthly target goal updated successfully.</span>
        </div>
      )}

      {/* Monthly Target Progress — matches target_setup.dart in mobile app */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Monthly Target Goal</p>
              <button
                onClick={() => {
                  setCustomTargetInput(String(monthlyTarget));
                  setShowTargetModal(true);
                }}
                className="text-[10px] text-primary font-bold hover:underline"
              >
                (Edit Goal)
              </button>
            </div>
            <p className="text-xl font-extrabold mt-0.5">
              ₹{monthlyAchieved.toLocaleString('en-IN')} / ₹{monthlyTarget.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm font-black text-primary bg-primary/10 px-3 py-1 rounded-xl border border-primary/20">
              {Math.round(progress * 100)}%
            </span>
            <p className="text-[10px] text-muted-foreground font-mono mt-1">{daysRemaining} days left in month</p>
          </div>
        </div>
        <div className="h-2.5 w-full bg-muted/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-1000"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground pt-1 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <span>💡</span>
            <span>Target Pace: <strong>{dailyVisitsRequired} visits/day</strong> needed to achieve monthly goal</span>
          </span>
          <button
            onClick={() => {
              setCustomTargetInput(String(monthlyTarget));
              setShowTargetModal(true);
            }}
            className="text-xs font-bold text-primary hover:underline"
          >
            Adjust Target ➔
          </button>
        </p>
      </div>

      {/* KPI Grid — matches _buildKPIGrid in dashboard_screen.dart (8 KPI cards) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <span>📊 Performance & Clinical Telemetry</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </h2>
          <span className="text-[11px] text-muted-foreground font-mono">Live Sync • 2026 Governance</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {kpiCards.map((kpi) => {
            const card = (
              <div
                key={kpi.label}
                className="group relative bg-card border border-border/80 p-4 sm:p-5 rounded-3xl shadow-sm overflow-hidden hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/40 transition-all duration-300 cursor-pointer"
              >
                {/* Ambient glow accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Shimmer sweep bar on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                <div className="flex items-center justify-between mb-2 relative z-10">
                  <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                    {kpi.label}
                  </span>
                  <div className={`w-8 h-8 rounded-xl ${kpi.color} flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    {kpi.icon}
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight relative z-10 group-hover:text-primary transition-colors">
                  {isLoading ? <span className="text-muted-foreground text-base">—</span> : kpi.value}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between relative z-10">
                  <span>{kpi.sub}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                </div>
              </div>
            );
            return kpi.href ? <Link key={kpi.label} href={kpi.href} prefetch={false}>{card}</Link> : card;
          })}
        </div>
      </div>

      {/* AI Insight — matches _buildAIInsight in dashboard_screen.dart */}
      <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-foreground">Aries AI Insight</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1">
              Repeat patients generate 2× more trust and 3× more income. Follow up with patients nearing session completion.
            </p>
          </div>
          <Link href="/app/buddy" prefetch={false}>
            <Button variant="outline" className="h-9 px-4 rounded-xl text-xs font-bold border-primary/30 text-primary hover:bg-primary/10 shrink-0">
              Open Copilot →
            </Button>
          </Link>
        </div>
      </div>

      {/* Today's Schedule + Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Today's Appointments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold tracking-tight">Today's Treatment Itinerary</h3>
            <Link href="/app/appointments" className="text-xs font-bold text-primary hover:underline flex items-center gap-1" prefetch={false}>
              <span>Full Schedule</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : todayAppointments.length === 0 ? (
            <div className="p-8 rounded-3xl border border-dashed border-border/80 text-center text-muted-foreground">
              <CalendarCheck className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No visits scheduled for today</p>
              <Link href="/app/leads" prefetch={false}>
                <Button variant="outline" className="mt-3 rounded-xl text-xs font-bold">Browse New Leads</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((apt: any) => {
                const isCompleted = ['Completed', 'completed'].includes(apt.status || '');
                const patientName = apt.patient?.name || apt.patient?.fullName || apt.patientDetails?.name || 'Patient';
                const age = apt.patient?.age || apt.patientDetails?.age;
                const time = apt.startTime || apt.scheduledTime || '';
                const session = apt.sessionNumber && apt.totalSessions
                  ? `Session ${apt.sessionNumber} of ${apt.totalSessions}`
                  : '';
                const fee = apt.sessionFee || apt.totalAmount;
                return (
                  <div
                    key={apt._id || apt.id}
                    className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
                      isCompleted
                        ? 'border-border/80 bg-card/60'
                        : 'border-2 border-primary/30 bg-primary/5'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isCompleted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary text-white shadow-md'
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Navigation className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold text-foreground">
                            {patientName}{age ? ` (${age}y)` : ''}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCompleted
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-primary text-white'
                          }`}>
                            {isCompleted ? 'Completed ✓' : time ? `Next Up (${time})` : apt.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {apt.condition || apt.packageName || '—'} • {apt.patient?.address || apt.patientDetails?.address || ''}
                        </p>
                        {session && (
                          <p className="text-[11px] font-semibold text-primary mt-1">
                            {session}{fee ? ` • ₹${fee.toLocaleString('en-IN')} fee` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    {!isCompleted && (
                      <Link href="/app/visits" prefetch={false}>
                        <Button className="h-9 px-4 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs shadow-md shrink-0">
                          Start →
                        </Button>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: AI Buddy + Comprehensive 12 Quick Shortcuts */}
        <div className="space-y-4">
          {/* AI Buddy Card */}
          <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Aries AI Clinical Buddy</h4>
                  <p className="text-[10px] text-muted-foreground">Doorstep Physio Copilot</p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full">Active</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ask about clinical differentials, exercise progressions, or red flags before starting your next visit.
            </p>
            <Link href="/app/buddy" className="block" prefetch={false}>
              <Button variant="outline" className="w-full h-10 rounded-xl text-xs font-bold border-primary/40 text-primary hover:bg-primary/10">
                Open AI Case Copilot →
              </Button>
            </Link>
          </div>

          {/* Quick Shortcuts — 12 Complete Modules */}
          <div className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Quick Action Hub</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: '/app/gaming', icon: '🎮', label: 'Gaming Arena', sub: 'Tournaments & Shop' },
                { href: '/app/telehealth', icon: '📹', label: 'Telehealth Room', sub: 'Video Consults' },
                { href: '/app/attendance', icon: '⏰', label: 'Daily Attendance', sub: 'GPS Clock-In' },
                { href: '/app/invoices', icon: '🧾', label: 'Tax Invoices', sub: 'Dynamic UPI QR' },
                { href: '/app/quality', icon: '⭐', label: 'Quality Score', sub: 'NPS & Audits' },
                { href: '/app/sos', icon: '🚨', label: 'Emergency SOS', sub: 'Panic Alarm' },
                { href: '/app/wallet', icon: '💼', label: 'My Wallet', sub: formatCurrency(walletBalance) },
                { href: '/app/referrals', icon: '🎁', label: 'Refer & Earn', sub: '₹1,000 / Colleague' },
                { href: '/app/availability', icon: '📍', label: 'Availability', sub: 'Manage Pincodes' },
                { href: '/app/training', icon: '🎓', label: 'SOP Library', sub: 'Clinical Protocols' },
                { href: '/app/patients', icon: '👥', label: 'My Patients', sub: `${stats.uniquePatients ?? 0} patients` },
                { href: '/app/earnings', icon: '📈', label: 'Earnings', sub: 'Analytics & TDS' },
              ].map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="p-3 rounded-2xl bg-muted/30 hover:bg-muted/60 border border-border/60 transition-all text-left"
                  prefetch={false}
                >
                  <div className="text-base mb-1">{s.icon}</div>
                  <div className="text-xs font-bold text-foreground truncate">{s.label}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{s.sub}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Target Setup Modal (target_setup.dart parity) */}
      {showTargetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowTargetModal(false)}>
          <div className="bg-card border border-border rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-outfit font-extrabold text-foreground">Configure Monthly Goal</h3>
              <button onClick={() => setShowTargetModal(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <div className="space-y-1 text-xs">
              <p className="text-muted-foreground">
                Set your target monthly revenue goal. Aries will calculate your required daily doorstep visit pace.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground">Monthly Earnings Target (₹)</label>
              <Input
                type="number"
                value={customTargetInput}
                onChange={(e) => setCustomTargetInput(e.target.value)}
                className="text-lg font-mono font-black h-12 rounded-2xl border-2 border-primary/40 text-center"
              />
            </div>

            <div className="p-3 bg-muted/30 rounded-2xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Days Remaining:</span>
                <span className="font-bold font-mono">{daysRemaining} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Required Daily Visits:</span>
                <span className="font-bold text-primary font-mono">
                  ~{Math.ceil(Math.max(0, parseInt(customTargetInput || '0') - monthlyAchieved) / (720 * daysRemaining))} visits/day
                </span>
              </div>
            </div>

            <Button onClick={handleSaveTarget} className="w-full h-11 rounded-2xl bg-primary text-white font-extrabold text-xs">
              Save Monthly Goal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

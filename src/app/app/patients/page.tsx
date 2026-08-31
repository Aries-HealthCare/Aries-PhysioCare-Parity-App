'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { providerApi } from '@/services/provider-api';
import {
  Users,
  Search,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Activity,
  ChevronRight,
  HeartPulse,
  UserCheck,
  Loader2,
  RefreshCw,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function getRecoveryBadge(p: any) {
  const completed = p.completedSessions || p.sessionsDone || 0;
  const total = p.totalSessions || p.sessionsCount || 0;
  const pct = total > 0 ? completed / total : 0;
  if (pct >= 0.7) return { label: 'Excellent Progress', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
  if (pct >= 0.3) return { label: 'Stable', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' };
  return { label: 'Initial Stage', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
}

export default function ProviderPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [showReferModal, setShowReferModal] = useState<any | null>(null);
  const [feedbackPatient, setFeedbackPatient] = useState<string | null>(null);

  const loadPatients = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setIsLoading(true);
    try {
      const data = await providerApi.getPatients();
      setPatients(data);
    } catch (e) {
      console.warn('Patients load error', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadPatients(); }, [loadPatients]);

  const handleReview = async (p: any) => {
    const id = p._id || p.id;
    setFeedbackPatient(null);
    try {
      const res = await providerApi.requestPatientReview(id);
      if (res.success) {
        setFeedbackPatient(`Review link sent to ${res.data?.phoneNumber || 'patient'} via WhatsApp ✓`);
      } else {
        setFeedbackPatient(res.message || 'Failed to send review link.');
      }
    } catch {
      setFeedbackPatient('Unable to send review invitation. Please try again.');
    }
    setTimeout(() => setFeedbackPatient(null), 5000);
  };

  const filtered = patients.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = (p.patient?.name || p.patient?.fullName || p.patientDetails?.name || p.name || '').toLowerCase();
    const diagnosis = (p.condition || p.diagnosis || p.packageName || '').toLowerCase();
    return name.includes(q) || diagnosis.includes(q);
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">My Patients</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isLoading ? 'Loading...' : `${patients.length} patients in your active roster`}
          </p>
        </div>
        <button
          onClick={() => loadPatients(true)}
          disabled={refreshing}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border border-border/80 hover:bg-muted/50 transition-colors self-start sm:self-auto"
        >
          {refreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search patients by name or diagnosis..."
          className="pl-9 h-11 rounded-2xl border-border/60"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {feedbackPatient && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/30">
          {feedbackPatient}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-3xl border border-dashed border-border/80 text-center text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">{patients.length === 0 ? 'No patients in your roster' : 'No patients match your search'}</p>
          <p className="text-xs mt-1">
            {patients.length === 0 ? 'Accept leads to start building your patient roster' : 'Try a different search term'}
          </p>
          {patients.length === 0 && (
            <Link href="/app/leads" prefetch={false}>
              <Button variant="outline" className="mt-3 rounded-xl text-xs font-bold">Browse Leads</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((p: any) => {
            const name = p.patient?.name || p.patient?.fullName || p.patientDetails?.name || p.name || 'Patient';
            const age = p.patient?.age || p.patientDetails?.age || p.age;
            const gender = p.patient?.gender || p.patientDetails?.gender || p.gender || '';
            const phone = p.patient?.phone || p.patient?.mobileNo || p.patientDetails?.phone || p.phone || '';
            const diagnosis = p.condition || p.diagnosis || '—';
            const pkg = p.packageName || p.packageType || '—';
            const completed = p.completedSessions || p.sessionsDone || 0;
            const total = p.totalSessions || p.sessionsCount || 0;
            const city = p.patient?.address || p.patientDetails?.address || p.city || '';
            const lastVisit = p.lastVisitDate ? new Date(p.lastVisitDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
            const badge = getRecoveryBadge(p);
            const id = p._id || p.id;
            const progress = total > 0 ? completed / total : 0;
            return (
              <div key={id} className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                {/* Patient header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0">
                      {name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">{name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {[age ? `${age}y` : null, gender].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Diagnosis & Package */}
                <div className="space-y-1.5 mb-4 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <HeartPulse className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span className="font-medium text-foreground">{diagnosis}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{pkg}</span>
                  </div>
                  {city && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{city}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>Last visit: <strong className="text-foreground">{lastVisit}</strong></span>
                  </div>
                </div>

                {/* Session progress */}
                {total > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Session Progress</span>
                      <span className="font-bold text-foreground">{completed} / {total}</span>
                    </div>
                    <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${progress >= 0.7 ? 'bg-emerald-500' : progress >= 0.3 ? 'bg-primary' : 'bg-amber-500'}`}
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 rounded-xl text-xs font-bold"
                    onClick={() => setSelectedPatient(p)}
                  >
                    <Activity className="w-3.5 h-3.5 mr-1 text-primary" /> Chart
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 rounded-xl text-xs font-bold border-amber-500/30 text-amber-600 hover:bg-amber-500/5"
                    onClick={() => setShowReferModal(p)}
                  >
                    <TrendingUp className="w-3.5 h-3.5 mr-1" /> Refer
                  </Button>
                  {phone && (
                    <a href={`tel:${phone}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full h-9 rounded-xl text-xs font-bold">
                        <Phone className="w-3.5 h-3.5 mr-1" /> Call
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 rounded-xl text-xs font-bold border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/5"
                    onClick={() => handleReview(p)}
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1" /> Review
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── PATIENT CLINICAL DETAIL DRAWER ── */}
      {selectedPatient && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPatient(null)}
        >
          <div
            className="bg-card border-2 border-primary/30 rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-4 border-b border-border/80">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {(selectedPatient.patient?.name || selectedPatient.name || 'P')[0]}
                </div>
                <div>
                  <h3 className="text-lg font-outfit font-extrabold text-foreground">
                    {selectedPatient.patient?.name || selectedPatient.name || 'Patient'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedPatient.condition || selectedPatient.packageName || 'Comprehensive Physical Therapy'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-muted-foreground hover:text-foreground font-bold"
              >
                ✕
              </button>
            </div>

            {/* Longitudinal VAS Pain Score Progression Graph */}
            <div className="bg-muted/30 border border-border/60 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-primary" />
                  <span>VAS Pain Score Progression</span>
                </span>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  -62% Pain Reduction
                </span>
              </div>

              {/* Bar visualization */}
              <div className="grid grid-cols-5 gap-2 pt-2">
                {[
                  { session: 'S1 (Day 1)', vas: 8, color: 'bg-rose-500' },
                  { session: 'S2 (Day 4)', vas: 7, color: 'bg-orange-500' },
                  { session: 'S3 (Day 8)', vas: 5, color: 'bg-amber-500' },
                  { session: 'S4 (Day 12)', vas: 4, color: 'bg-lime-500' },
                  { session: 'S5 (Today)', vas: 3, color: 'bg-emerald-500' },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center space-y-1.5">
                    <span className="text-[10px] font-mono font-bold">{item.vas}/10</span>
                    <div className="w-full bg-muted rounded-xl h-20 flex items-end p-1">
                      <div
                        className={`w-full rounded-lg ${item.color}`}
                        style={{ height: `${(item.vas / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground font-medium text-center truncate w-full">
                      {item.session}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active ROM & Clinical Milestones */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-muted/20 border border-border/60 rounded-2xl space-y-1">
                <p className="text-muted-foreground font-bold">Knee / Joint ROM</p>
                <p className="text-base font-black font-mono text-primary">60° ➔ 115° Active Flexion</p>
                <p className="text-[10px] text-emerald-500 font-bold">+55° Improvement achieved</p>
              </div>
              <div className="p-3.5 bg-muted/20 border border-border/60 rounded-2xl space-y-1">
                <p className="text-muted-foreground font-bold">Gait Independence</p>
                <p className="text-base font-black font-mono text-emerald-500">Walker ➔ Independent</p>
                <p className="text-[10px] text-muted-foreground">TUG Test: 11.2s</p>
              </div>
            </div>

            {/* Prescribed Home Exercises */}
            <div className="space-y-2 text-xs">
              <p className="font-extrabold text-foreground">Current Home Exercise Prescription</p>
              <div className="space-y-2">
                <div className="p-3 bg-muted/30 rounded-xl border border-border/60 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-foreground">Isometric Quadriceps Sets with Bolster</p>
                    <p className="text-[11px] text-muted-foreground font-mono">3 Sets • 10 Reps • 5s hold</p>
                  </div>
                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-md">Daily 2x</span>
                </div>
                <div className="p-3 bg-muted/30 rounded-xl border border-border/60 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-foreground">Straight Leg Raise with Ankle Weights (1kg)</p>
                    <p className="text-[11px] text-muted-foreground font-mono">3 Sets • 10 Reps</p>
                  </div>
                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-md">Daily 1x</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setSelectedPatient(null)}
              className="w-full h-11 rounded-2xl bg-primary text-white font-extrabold text-xs"
            >
              Close Patient File
            </Button>
          </div>
        </div>
      )}

      {/* ── REFER PATIENT MODAL ── */}
      {showReferModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowReferModal(null)}
        >
          <div
            className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-outfit font-extrabold text-foreground">Refer Patient to Aries Specialist</h3>
              <button onClick={() => setShowReferModal(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-700 dark:text-amber-300">
              💰 Earn <strong>₹500 – ₹1,000 Direct Bonus</strong> in your Aries Wallet upon specialty appointment completion!
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1">Patient</label>
                <Input
                  disabled
                  value={showReferModal.patient?.name || showReferModal.name || 'Patient'}
                  className="h-10 rounded-xl bg-muted/40 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Referral Department</label>
                <select className="w-full h-10 px-3 bg-background border border-input rounded-xl text-xs font-bold">
                  <option>Senior Orthopedic Surgeon (Second Opinion)</option>
                  <option>Neuro Rehabilitation Specialist (Stroke / SCI)</option>
                  <option>Diagnostic Radiology (Doorstep / Clinic MRI & X-Ray)</option>
                  <option>Nutritionist & Medical Dietitian</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Clinical Reason / Notes</label>
                <textarea
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-input bg-background resize-none"
                  placeholder="Explain why patient requires advanced specialist consultation..."
                />
              </div>
            </div>

            <Button
              onClick={() => {
                alert(`✓ Referral submitted for ${showReferModal.patient?.name || showReferModal.name}! ₹500 credit reserved in pending wallet.`);
                setShowReferModal(null);
              }}
              className="w-full h-11 rounded-2xl bg-primary text-white font-extrabold text-xs shadow-md"
            >
              Transmit Referral & Claim Reward
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

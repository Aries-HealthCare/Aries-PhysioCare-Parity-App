'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { providerApi } from '@/services/provider-api';
import {
  Radio,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  User,
  Phone,
  Calendar,
  RefreshCw,
  Zap,
  Loader2,
  UserCheck,
  MessageSquare,
  FileText,
  Navigation,
  AlertTriangle,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const PASS_REASONS = ['Busy', 'Not Interested', 'Location Too Far', 'Price Issue', 'Other'];

function getExpiryText(lead: any): string {
  const createdAt = lead.createdAt ? new Date(lead.createdAt) : null;
  const expiresIn = lead.expiresIn?.toString() || '72 hours';
  if (!createdAt) return lead.expiresIn ? String(lead.expiresIn) : 'Expires soon';

  let durationMs = 72 * 3600 * 1000;
  const match = expiresIn.match(/(\d+)\s*(hour|day|h|d)/i);
  if (match) {
    const val = parseInt(match[1]);
    durationMs = match[2].startsWith('d') ? val * 86400000 : val * 3600000;
  }
  const expiry = new Date(createdAt.getTime() + durationMs);
  const remaining = expiry.getTime() - Date.now();
  if (remaining <= 0) return 'Expired';
  const hrs = Math.floor(remaining / 3600000);
  const mins = Math.floor((remaining % 3600000) / 60000);
  if (hrs > 24) return `Expires in ${Math.floor(hrs / 24)}d ${hrs % 24}h`;
  if (hrs > 0) return `Expires in ${hrs}h ${mins}m`;
  return `Expires in ${mins}m`;
}

function getUrgencyBadge(urgency?: string) {
  switch ((urgency || '').toUpperCase()) {
    case 'HIGH':
    case 'URGENT':
      return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500/10 text-red-500 border border-red-500/20">🔴 Urgent</span>;
    case 'HIGH_DEMAND':
      return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">🟠 High Demand</span>;
    case 'MEDIUM':
      return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">🟡 Medium</span>;
    default:
      return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">🗓 Scheduled</span>;
  }
}

export default function ProviderLeadsPage() {
  const [activeTab, setActiveTab] = useState<'new' | 'acquired'>('new');
  const [newLeads, setNewLeads] = useState<any[]>([]);
  const [acquiredLeads, setAcquiredLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [passDialogLead, setPassDialogLead] = useState<any | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const loadLeads = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      const data = await providerApi.getLeads();
      setNewLeads(data.newLeads || []);
      setAcquiredLeads(data.acquiredLeads || []);
    } catch (e) {
      console.warn('Leads load error', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { loadLeads(); }, [loadLeads]);

  const showFeedback = (type: 'success' | 'error' | 'info', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleInterest = async (lead: any) => {
    const id = lead._id || lead.id;
    try {
      const res = await providerApi.expressInterest(id);
      if (res.success) {
        setNewLeads((prev) => prev.filter((l) => (l._id || l.id) !== id));
        showFeedback('success', 'Interest registered. Waiting for admin approval.');
      } else {
        showFeedback('error', res.message || 'Failed to register interest.');
      }
    } catch {
      showFeedback('error', 'Unable to register interest. Please try again.');
    }
  };

  const handlePass = async (lead: any, reason: string) => {
    const id = lead._id || lead.id;
    setPassDialogLead(null);
    try {
      await providerApi.passLead(id, reason);
      setNewLeads((prev) => prev.filter((l) => (l._id || l.id) !== id));
      showFeedback('info', 'Lead passed. It has been recirculated to nearby therapists.');
    } catch {
      showFeedback('error', 'Failed to pass lead. Please try again.');
    }
  };

  const handleReview = async (lead: any) => {
    const id = lead._id || lead.id;
    showFeedback('info', 'Sending review invitation via WhatsApp...');
    try {
      const res = await providerApi.requestPatientReview(id);
      if (res.success) {
        showFeedback('success', `Review link sent to ${res.data?.phoneNumber || 'patient'} via WhatsApp!`);
      } else {
        showFeedback('error', res.message || 'Failed to send review invitation.');
      }
    } catch {
      showFeedback('error', 'Unable to send review invitation via WhatsApp.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header — matches 'Clients & Leads' heading in clients_leads.dart */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Clients & Leads</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage your patient pipeline</p>
        </div>
        <button
          onClick={() => loadLeads(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border border-border/80 hover:bg-muted/50 transition-colors self-start sm:self-auto"
        >
          {isRefreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Refresh
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
          feedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30' :
          feedback.type === 'error' ? 'bg-red-500/10 text-red-600 border border-red-500/30' :
          'bg-blue-500/10 text-blue-600 border border-blue-500/30'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> :
           feedback.type === 'error' ? <XCircle className="w-4 h-4 shrink-0" /> :
           <Radio className="w-4 h-4 shrink-0" />}
          {feedback.text}
        </div>
      )}

      {/* Tab Toggle — matches _buildTabToggle in clients_leads.dart */}
      <div className="h-13 p-1 bg-muted/30 border border-border/60 rounded-[26px] flex relative">
        <div
          className="absolute top-1 bottom-1 w-1/2 bg-primary rounded-[22px] shadow-md transition-all duration-280"
          style={{ left: activeTab === 'new' ? '4px' : 'calc(50% - 4px)' }}
        />
        <button
          onClick={() => setActiveTab('new')}
          className={`flex-1 relative z-10 text-xs font-bold rounded-[22px] transition-colors py-2.5 ${
            activeTab === 'new' ? 'text-white' : 'text-muted-foreground'
          }`}
        >
          New Leads {newLeads.length > 0 && <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">{newLeads.length}</span>}
        </button>
        <button
          onClick={() => setActiveTab('acquired')}
          className={`flex-1 relative z-10 text-xs font-bold rounded-[22px] transition-colors py-2.5 ${
            activeTab === 'acquired' ? 'text-white' : 'text-muted-foreground'
          }`}
        >
          My Patients {acquiredLeads.length > 0 && <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">{acquiredLeads.length}</span>}
        </button>
      </div>

      {/* AI notice for new leads tab */}
      {activeTab === 'new' && (
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-3">
          <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-foreground">Aries AI Lead Matching Active</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Leads are matched based on your registered service pincodes, specialization, and availability.
              Express interest quickly — leads expire within 4–72 hours.
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : activeTab === 'new' ? (
        newLeads.length === 0 ? (
          <div className="p-12 rounded-3xl border border-dashed border-border/80 text-center text-muted-foreground">
            <Radio className="w-10 h-10 mx-auto mb-3 opacity-40 animate-pulse" />
            <p className="text-sm font-medium">No new leads available</p>
            <p className="text-xs mt-1">Check back soon — new leads broadcast every few minutes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {newLeads.map((lead: any) => {
              const patientName = lead.patientName || lead.patient?.name || lead.patient?.fullName || 'Patient';
              const age = lead.patientAge || lead.age || lead.patient?.age;
              const gender = lead.patientGender || lead.gender || lead.patient?.gender;
              const condition = lead.condition || '—';
              const pkg = lead.packageType || lead.packageName || '—';
              const locality = lead.locality || lead.location || lead.city || '—';
              const distance = lead.distanceKm;
              const payout = lead.payoutAmount || lead.sessionFee;
              const urgency = lead.urgency;
              const expiryText = getExpiryText(lead);
              const id = lead._id || lead.id;
              return (
                <div key={id} className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  {/* Patient info row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-foreground">{patientName}</h3>
                        {age && <span className="text-[10px] text-muted-foreground">({age}y{gender ? ` ${gender[0]}` : ''})</span>}
                        {urgency && getUrgencyBadge(urgency)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{condition}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FileText className="w-3.5 h-3.5 shrink-0 text-primary" />
                      <span>{pkg}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                      <span className="font-medium text-foreground">{locality}</span>
                      {distance && <span>({distance} km away)</span>}
                    </div>
                    {(lead.scheduledDate || lead.scheduledTime) && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 shrink-0 text-primary" />
                        <span>{lead.scheduledDate || lead.scheduledTime}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-500 font-bold">₹{(payout || 0).toLocaleString('en-IN')} Therapist Payout</span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {expiryText}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons — matches Express Interest & Pass buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-10 rounded-2xl text-xs font-bold border-destructive/30 text-destructive hover:bg-destructive/5"
                      onClick={() => setPassDialogLead(lead)}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1.5" /> Pass
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 h-10 rounded-2xl bg-primary hover:bg-primary/95 text-white font-bold text-xs shadow-md shadow-primary/20"
                      onClick={() => handleInterest(lead)}
                    >
                      <Zap className="w-3.5 h-3.5 mr-1.5" /> Express Interest
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Acquired Leads / My Patients Tab */
        acquiredLeads.length === 0 ? (
          <div className="p-12 rounded-3xl border border-dashed border-border/80 text-center text-muted-foreground">
            <UserCheck className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">You have no active patients</p>
            <p className="text-xs mt-1">Accept leads to build your patient roster</p>
            <Button variant="outline" className="mt-3 rounded-xl text-xs font-bold" onClick={() => setActiveTab('new')}>
              Browse New Leads
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {acquiredLeads.map((lead: any) => {
              const patientName = lead.patientName || lead.patient?.name || lead.patient?.fullName || 'Patient';
              const age = lead.patientAge || lead.age || lead.patient?.age;
              const gender = lead.patientGender || lead.gender || lead.patient?.gender;
              const condition = lead.condition || lead.diagnosis || '—';
              const pkg = lead.packageType || lead.packageName || '—';
              const phone = lead.phone || lead.patient?.phone || lead.patient?.mobileNo || '';
              const completed = lead.completedSessions || 0;
              const total = lead.totalSessions || lead.sessionsCount || 0;
              const progress = total > 0 ? completed / total : 0;
              const id = lead._id || lead.id;
              return (
                <div key={id} className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  {/* Patient info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm">
                      {patientName[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-foreground truncate">{patientName}</h3>
                        {age && <span className="text-[10px] text-muted-foreground">({age}y{gender ? ` ${gender[0]}` : ''})</span>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{condition}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">Active</span>
                  </div>

                  {/* Package & sessions */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FileText className="w-3.5 h-3.5 shrink-0 text-primary" />
                      <span>{pkg}</span>
                    </div>
                    {total > 0 && (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Sessions completed</span>
                          <span className="font-bold text-foreground">{completed}/{total}</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${progress * 100}%` }} />
                        </div>
                      </div>
                    )}
                    {lead.address && (
                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-primary mt-0.5" />
                        <span className="line-clamp-1">{lead.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons — Call, WhatsApp Review, Schedule */}
                  <div className="flex flex-wrap gap-2">
                    {phone && (
                      <a href={`tel:${phone}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full h-9 rounded-xl text-xs font-bold">
                          <Phone className="w-3.5 h-3.5 mr-1" /> Call
                        </Button>
                      </a>
                    )}
                    <Button variant="outline" size="sm" className="flex-1 h-9 rounded-xl text-xs font-bold border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/5" onClick={() => handleReview(lead)}>
                      <MessageSquare className="w-3.5 h-3.5 mr-1" /> Review
                    </Button>
                    <Link href="/app/appointments" prefetch={false} className="flex-1">
                      <Button size="sm" className="w-full h-9 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs border border-primary/20">
                        <Calendar className="w-3.5 h-3.5 mr-1" /> Schedule
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Pass Lead Dialog — matches _showPassDialog in clients_leads.dart */}
      {passDialogLead && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4" onClick={() => setPassDialogLead(null)}>
          <div className="bg-card border border-border rounded-3xl w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-border">
              <h3 className="text-base font-bold">Reason for Passing</h3>
              <p className="text-xs text-muted-foreground mt-1">Please select a reason to pass this lead</p>
            </div>
            <div className="divide-y divide-border">
              {PASS_REASONS.map((reason) => (
                <button
                  key={reason}
                  className="w-full px-5 py-4 text-sm text-left hover:bg-muted/50 transition-colors font-medium"
                  onClick={() => handlePass(passDialogLead, reason)}
                >
                  {reason}
                </button>
              ))}
            </div>
            <div className="p-4">
              <Button variant="outline" className="w-full rounded-xl font-bold text-xs" onClick={() => setPassDialogLead(null)}>
                CANCEL
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Copy,
  Gift,
  Loader2,
  Plus,
  Share2,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';
import { useToast } from '@/hooks/use-toast';

export default function AppReferralsDashboardPage() {
  const { user } = useProviderAuth();
  const { toast } = useToast();

  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<'code' | 'link' | null>(null);

  const [showInvite, setShowInvite] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [doctorMobile, setDoctorMobile] = useState('');
  const [specialization, setSpecialization] = useState('Physiotherapist');
  const [city, setCity] = useState(user?.city || '');
  const [submitting, setSubmitting] = useState(false);

  const referralCode =
    user?.axId ||
    user?.ariesId ||
    (user?.fullName ? `${user.fullName.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 8)}1000` : 'ARIES1000');
  const referralLink = `https://ariesphysiocare.com/register?ref=${encodeURIComponent(referralCode)}`;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await providerApi.fetchReferrals(user?._id);
      setReferrals(Array.isArray(data.referTherapist) ? data.referTherapist : []);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Could not load app referral analytics.');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeJoined = referrals.filter((r) =>
    ['active', 'approved', 'completed', 'joined'].includes(String(r.status || '').toLowerCase())
  ).length;
  const pendingCount = referrals.length - activeJoined;
  const earnedTotal = activeJoined * 1000;
  const nextMilestone = activeJoined < 3 ? 3 : activeJoined < 5 ? 5 : 10;
  const milestonePct = Math.min(100, Math.round((activeJoined / nextMilestone) * 100));

  const copyValue = async (val: string, kind: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(val);
      setCopiedKey(kind);
      toast({
        title: kind === 'code' ? 'Referral code copied' : 'Invite link copied',
        description: val,
      });
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast({ title: 'Copy failed', description: 'Please copy manually.', variant: 'destructive' });
    }
  };

  const handleShareWhatsApp = () => {
    const msg = `Join AriesXpert as a verified physiotherapist! Register with my referral code ${referralCode}: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName.trim() || doctorMobile.replace(/\D/g, '').length < 10) {
      toast({
        title: 'Incomplete colleague details',
        description: 'Enter the clinician name and a valid 10-digit mobile number.',
        variant: 'destructive',
      });
      return;
    }
    setSubmitting(true);
    try {
      const res = await providerApi.createReferTherapist({
        referredBy: user?._id || user?.id || '',
        doctorName: doctorName.trim(),
        doctorMobile: doctorMobile.trim(),
        specialization: specialization.trim() || 'Physiotherapist',
        city: city.trim() || user?.city || '',
      });
      if (res.success === false) {
        throw new Error(res.message || 'Could not submit colleague referral.');
      }
      toast({
        title: 'Invitation sent',
        description: `${doctorName.trim()} has been invited to AriesXpert.`,
      });
      setShowInvite(false);
      setDoctorName('');
      setDoctorMobile('');
      await load();
    } catch (err: any) {
      toast({
        title: 'Invitation failed',
        description: err?.message || 'Please try again shortly.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/app/referrals"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Referrals</span>
          </Link>
          <h1 className="text-2xl font-outfit font-extrabold tracking-tight">App &amp; Colleague Referrals Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            Track colleague sign-ups, unlock referral tier milestones, and earn ₹1,000 per verified onboarding.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={handleShareWhatsApp} className="h-10 rounded-2xl text-xs font-bold gap-1.5">
            <Share2 className="w-4 h-4 text-emerald-500" />
            <span>Share on WhatsApp</span>
          </Button>
          <Button type="button" onClick={() => setShowInvite(true)} className="h-10 rounded-2xl text-xs font-extrabold gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Invite Colleague</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-bold flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={load} className="underline">
            Retry
          </button>
        </div>
      )}

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-bold">
            <span>Total Invited</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-mono font-black mt-2">{referrals.length}</p>
        </div>
        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-bold">
            <span>Active Joined</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-mono font-black text-emerald-500 mt-2">{activeJoined}</p>
        </div>
        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-bold">
            <span>Pending Onboarding</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-mono font-black text-amber-500 mt-2">{pendingCount}</p>
        </div>
        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-bold">
            <span>Bonus Earned</span>
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-mono font-black text-primary mt-2">₹{earnedTotal.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Share & Milestone Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-outfit font-extrabold">Your Referral Invite Kit</h2>
              <p className="text-xs text-muted-foreground">Share your code or direct link with physiotherapists in your network.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-bold text-muted-foreground">Referral Code</Label>
              <div className="flex gap-2 mt-1">
                <Input readOnly value={referralCode} className="h-10 rounded-xl font-mono font-extrabold bg-background/80" />
                <Button type="button" onClick={() => copyValue(referralCode, 'code')} className="h-10 px-3 rounded-xl">
                  {copiedKey === 'code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label className="text-xs font-bold text-muted-foreground">Invite Link</Label>
              <div className="flex gap-2 mt-1">
                <Input readOnly value={referralLink} className="h-10 rounded-xl text-xs bg-background/80 truncate" />
                <Button type="button" onClick={() => copyValue(referralLink, 'link')} className="h-10 px-3 rounded-xl">
                  {copiedKey === 'link' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-3xl border border-border/80 bg-card p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-outfit font-extrabold">Ambassador Milestone</h2>
            <span className="text-xs font-mono font-bold text-primary">
              {activeJoined} / {nextMilestone} clinicians
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${milestonePct}%` }} />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Reach <strong>{nextMilestone} active referred therapists</strong> to unlock priority territory badge &amp; bonus incentives on top of ₹1,000 per verified referral.
          </p>
          <Button asChild variant="outline" size="sm" className="w-full rounded-xl text-xs font-bold">
            <Link href="/app/refer-patient">Switch to Patient Referrals (10% Recurring) →</Link>
          </Button>
        </div>
      </div>

      {/* Invited Colleagues Table/Cards */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-outfit font-extrabold">Invited Colleagues Pipeline</h3>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : referrals.length === 0 ? (
          <div className="py-10 text-center text-xs text-muted-foreground space-y-2">
            <Users className="w-8 h-8 mx-auto opacity-40" />
            <p className="font-bold text-foreground">No colleague referrals yet</p>
            <p>Invite fellow physiotherapists using your code or the Invite Colleague button above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {referrals.map((item, idx) => (
              <div
                key={item._id || item.id || idx}
                className="p-4 rounded-2xl border border-border/70 bg-muted/20 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold shrink-0">
                    {(item.doctorName || item.name || 'D').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-foreground truncate">{item.doctorName || item.name || 'Clinician'}</p>
                    <p className="text-muted-foreground truncate">
                      {item.specialization || 'Physiotherapist'} · {item.city || 'India'}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                    {item.status || 'Invited'}
                  </span>
                  <p className="text-[11px] font-mono font-bold text-emerald-500 mt-1">₹1,000 bonus</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowInvite(false)}
        >
          <div
            className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-outfit font-extrabold">Invite a Colleague Therapist</h3>
              <button type="button" onClick={() => setShowInvite(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label className="text-xs font-bold">Doctor Full Name *</Label>
                <Input value={doctorName} onChange={(e) => setDoctorName(e.target.value)} placeholder="Dr. Full Name" required />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold">Mobile Number *</Label>
                <Input value={doctorMobile} onChange={(e) => setDoctorMobile(e.target.value)} placeholder="10-digit mobile" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Specialization</Label>
                  <Input value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">City</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowInvite(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="rounded-xl font-bold">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Invite'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

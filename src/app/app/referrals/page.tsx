'use client';

import React, { useState, useEffect } from 'react';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';
import {
  Share2,
  Copy,
  Check,
  Gift,
  Users,
  TrendingUp,
  DollarSign,
  UserPlus,
  Stethoscope,
  Sparkles,
  Plus,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import Link from 'next/link';

export default function ProviderReferralsPage() {
  const { user } = useProviderAuth();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [referralList, setReferralList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [doctorMobile, setDoctorMobile] = useState('');
  const [specialization, setSpecialization] = useState('Physiotherapist');
  const [city, setCity] = useState(user?.city || 'Mumbai');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const referralCode =
    user?.axId ||
    (user?.fullName
      ? user.fullName.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 8) + '1000'
      : 'ARIES1000');
  const referralLink = `https://ariesphysiocare.com/register?ref=${referralCode}`;

  const loadReferrals = async () => {
    setIsLoading(true);
    try {
      const data = await providerApi.fetchReferrals(user?._id);
      if (data.referTherapist && Array.isArray(data.referTherapist)) {
        setReferralList(data.referTherapist);
      } else {
        setReferralList([]);
      }
    } catch (_) {
      setReferralList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReferrals();
  }, [user?._id]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleInviteDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName.trim() || !doctorMobile.trim()) {
      alert('Please fill doctor name and mobile number.');
      return;
    }

    setIsSubmitting(true);
    const res = await providerApi.createReferTherapist({
      referredBy: user?._id || user?.id || 'therapist_' + Date.now(),
      doctorName: doctorName.trim(),
      doctorMobile: doctorMobile.trim(),
      specialization,
      city,
    });
    setIsSubmitting(false);

    if (res.success !== false) {
      setShowInviteModal(false);
      setFeedback(`🎉 Colleague ${doctorName} invited successfully! ₹1,000 bonus will credit once they complete their first visit.`);
      setDoctorName('');
      setDoctorMobile('');
      loadReferrals();
    } else {
      alert(res.message || 'Failed to submit colleague referral.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Colleague Therapist Referrals</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Invite fellow physiotherapists and earn ₹1,000 when they complete their first doorstep session.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowInviteModal(true)}
            variant="outline"
            className="h-10 px-4 rounded-2xl font-extrabold text-xs shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Direct Invite</span>
          </Button>

          <Link href="/app/refer-patient" prefetch={false}>
            <Button className="h-10 px-4 rounded-2xl bg-primary text-white font-extrabold text-xs shadow-md flex items-center gap-1.5">
              <UserPlus className="w-4 h-4" />
              <span>Refer a Patient (10% Commission) ➔</span>
            </Button>
          </Link>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between">
          <span>{feedback}</span>
          <Button variant="ghost" size="sm" onClick={() => setFeedback(null)} className="h-6 text-xs">
            Dismiss
          </Button>
        </div>
      )}

      {/* Shareable Banner */}
      <div className="bg-gradient-to-br from-card via-card to-primary/10 border-2 border-primary/30 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-foreground">Your Dedicated Referral Code</h2>
            <p className="text-xs text-muted-foreground">Share this with certified physical therapists in your network.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground">Referral Code</label>
            <div className="flex gap-2 mt-1">
              <Input
                readOnly
                value={referralCode}
                className="font-mono font-extrabold text-base bg-muted/40 h-11 rounded-xl uppercase"
              />
              <Button onClick={handleCopyCode} className="h-11 px-4 rounded-xl font-bold text-xs">
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground">Direct Invite Link</label>
            <div className="flex gap-2 mt-1">
              <Input
                readOnly
                value={referralLink}
                className="text-xs text-muted-foreground bg-muted/40 h-11 rounded-xl truncate"
              />
              <Button onClick={handleCopyLink} className="h-11 px-4 rounded-xl font-bold text-xs">
                {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="p-6 rounded-3xl border-2 border-primary/40 bg-card shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-foreground">Directly Refer a Colleague Therapist</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowInviteModal(false)}>✕</Button>
          </div>

          <form onSubmit={handleInviteDoctor} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <Label className="text-xs font-bold">Colleague Doctor Name *</Label>
              <Input
                placeholder="Dr. Full Name"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label className="text-xs font-bold">Doctor Mobile Number *</Label>
              <Input
                placeholder="10-digit mobile"
                value={doctorMobile}
                onChange={(e) => setDoctorMobile(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label className="text-xs font-bold">Specialization</Label>
              <Input
                placeholder="e.g. Neuro Physiotherapy"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-bold">City</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowInviteModal(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary text-white font-bold">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Invitation'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Referral Milestones & Pipeline */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-foreground">Invited Therapists Tracker</h3>

        {referralList.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground space-y-2">
            <Users className="w-8 h-8 mx-auto text-muted-foreground/50" />
            <p>No therapist colleagues referred yet.</p>
            <p className="text-[11px]">Share your referral code or click &quot;Direct Invite&quot; to invite fellow doctors!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {referralList.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {(item.doctorName || item.name || 'D').charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{item.doctorName || item.name}</div>
                    <div className="text-muted-foreground">{item.specialization || 'Physiotherapist'} • {item.city || 'India'}</div>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="font-bold text-foreground">{item.status || 'Invited'}</div>
                  <div className="text-emerald-500 font-mono font-bold">₹1,000 on 1st visit</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


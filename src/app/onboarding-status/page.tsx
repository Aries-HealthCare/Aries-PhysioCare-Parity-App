'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Loader2,
  LogOut,
  Mail,
  MessageSquareText,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProviderAuth } from '@/services/provider-auth-context';
import {
  ONBOARDING_STEP_TITLES,
  getNextPendingStep,
  normalizeChecklist,
  type ParityChecklistItem,
} from '@/lib/onboarding-checklist';
import {
  resolveOnboardingDisplayState,
  type OnboardingDisplayState,
} from '@/lib/onboarding-gate';

const POLL_INTERVAL_MS = 15000;
const SUPPORT_EMAIL = 'info@ariesxpert.com';

const STATE_BADGE_CONFIG: Record<
  OnboardingDisplayState,
  { label: string; className: string; glowClass: string }
> = {
  pending: {
    label: 'Under Review',
    className: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    glowClass: 'bg-teal-500/15',
  },
  incomplete: {
    label: 'Action Required',
    className: 'bg-amber-500/15 text-amber-300 border-amber-500/35',
    glowClass: 'bg-amber-500/15',
  },
  rejected: {
    label: 'Application Declined',
    className: 'bg-rose-500/15 text-rose-300 border-rose-500/35',
    glowClass: 'bg-rose-500/15',
  },
  suspended: {
    label: 'Account Suspended',
    className: 'bg-rose-500/15 text-rose-300 border-rose-500/35',
    glowClass: 'bg-rose-500/15',
  },
  approved: {
    label: 'Approved & Active',
    className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35',
    glowClass: 'bg-emerald-500/15',
  },
};

function buildStepHref(step: number, key?: string): string {
  const normalizedStep = Number.isFinite(step) ? step : 0;
  const safeStep = Math.max(0, Math.min(4, Math.trunc(normalizedStep)));
  return key
    ? `/onboarding?step=${safeStep}&focus=${encodeURIComponent(key)}`
    : `/onboarding?step=${safeStep}`;
}

export default function OnboardingStatusPage() {
  const { user, isLoading, refreshProfile, logout } = useProviderAuth();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastCheckedLabel, setLastCheckedLabel] = useState<string>('Just now');
  const [refreshError, setRefreshError] = useState<string>('');

  const refreshFnRef = useRef(refreshProfile);
  refreshFnRef.current = refreshProfile;
  const isPollingRef = useRef(false);
  const pendingManualRefreshRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const displayState = useMemo(() => resolveOnboardingDisplayState(user), [user]);
  const checklist = useMemo(
    () => normalizeChecklist(user?.incompleteChecklist),
    [user?.incompleteChecklist]
  );

  const pendingCount = useMemo(
    () => checklist.filter((item) => item.status !== 'resubmitted').length,
    [checklist]
  );
  const updatedCount = checklist.length - pendingCount;

  const primaryIncompleteHref = useMemo(() => {
    if (checklist.length === 0) return '/onboarding';
    const nextStep = getNextPendingStep(checklist);
    const nextPendingItem = checklist.find((item) => item.status !== 'resubmitted');
    if (nextPendingItem) {
      return buildStepHref(nextPendingItem.step, nextPendingItem.key);
    }
    return buildStepHref(nextStep);
  }, [checklist]);

  const handleRefresh = useCallback(async (silent = false) => {
    if (isPollingRef.current) {
      if (!silent) {
        pendingManualRefreshRef.current = true;
        setIsRefreshing(true);
        setRefreshError('');
      }
      return;
    }
    isPollingRef.current = true;
    if (!silent) {
      setIsRefreshing(true);
      setRefreshError('');
    }
    try {
      await refreshFnRef.current();
      if (!isMountedRef.current) return;
      const now = new Date();
      setLastCheckedLabel(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setRefreshError('');
    } catch {
      if (!silent && isMountedRef.current) {
        setRefreshError('Could not check for updates right now. Please try again shortly.');
      }
    } finally {
      isPollingRef.current = false;
      if (pendingManualRefreshRef.current && isMountedRef.current) {
        pendingManualRefreshRef.current = false;
        void handleRefresh(false);
      } else if (!silent && isMountedRef.current) {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!isLoading && user && displayState === 'approved') {
      router.replace('/app');
    }
  }, [isLoading, user, displayState, router]);

  useEffect(() => {
    if (isLoading || !user?._id || displayState === 'approved') return;

    const timer = setInterval(() => {
      void handleRefresh(true);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isLoading, user?._id, displayState, handleRefresh]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen w-full bg-[#030712] text-white flex items-center justify-center p-6 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-teal-500/15 blur-3xl" />
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
          <p className="text-sm text-slate-300 font-medium">Loading your application status...</p>
        </div>
      </div>
    );
  }

  const badge = STATE_BADGE_CONFIG[displayState];
  const reviewerNote = (user.incompleteNote || '').trim() || (displayState === 'incomplete' ? (user.rejectionReason || '').trim() : '');
  const denialReason = (user.rejectionReason || '').trim();
  const providerName =
    user.fullName ||
    user.name ||
    [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
    'Clinician';

  return (
    <div className="min-h-screen w-full bg-[#030712] text-white relative overflow-hidden flex flex-col">
      {/* Ambient Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className={`absolute -top-28 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-3xl transition-colors duration-700 ${badge.glowClass}`}
        />
        <div className="absolute bottom-0 right-0 h-[340px] w-[340px] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-[#030712]/70 backdrop-blur-xl px-4 sm:px-8 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative rounded-xl overflow-hidden border border-teal-500/30 bg-slate-900/80 p-1 shadow-lg shadow-teal-950/50">
              <Image
                src="/aries-gold-emblem.png"
                alt="AriesXpert"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-outfit text-lg font-black tracking-tight text-white">
                Aries<span className="text-teal-400">Xpert</span>
              </span>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Credential Verification
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={logout}
            className="rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-2xl w-full rounded-3xl p-[1px] bg-gradient-to-b from-white/15 via-white/5 to-transparent shadow-2xl">
          <div className="w-full rounded-[calc(1.5rem-1px)] bg-[#0a0f1d]/90 backdrop-blur-2xl p-6 sm:p-8 border border-white/5 space-y-6">
            {/* Hero Status Block */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <StatusHeroIcon state={displayState} />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-outfit font-bold uppercase tracking-wider ${badge.className}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {badge.label}
                  </span>
                  <span className="text-xs text-slate-400 truncate">
                    {providerName}
                    {user.phone ? ` · ${user.phone}` : ''}
                  </span>
                </div>

                {displayState === 'pending' && (
                  <>
                    <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      Your Application Is Under Review
                    </h1>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Our clinical credentialing team is verifying your qualifications, identity
                      documents, and service territory. Most reviews complete within 24–48 hours.
                    </p>
                  </>
                )}

                {displayState === 'incomplete' && (
                  <>
                    <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      Updates Needed to Complete Registration
                    </h1>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Our verification team reviewed your profile and flagged the items below. Select
                      any item to jump directly to that section, update it, and resubmit.
                    </p>
                  </>
                )}

                {displayState === 'rejected' && (
                  <>
                    <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      Application Could Not Be Approved
                    </h1>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Your application did not meet our current verification requirements. Review the
                      feedback below, update your details, and submit again when ready.
                    </p>
                  </>
                )}

                {displayState === 'suspended' && (
                  <>
                    <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      Account Temporarily Suspended
                    </h1>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Access to clinical consultations and patient bookings is currently paused.
                      Please contact our support team for assistance with reinstating your account.
                    </p>
                  </>
                )}

                {displayState === 'approved' && (
                  <>
                    <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      Profile Approved!
                    </h1>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Welcome to the AriesXpert Clinical Network. Redirecting you to your
                      practitioner workstation now.
                    </p>
                  </>
                )}
              </div>
            </div>

            {refreshError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-200 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{refreshError}</span>
              </div>
            )}

            {/* Pending Review Timeline */}
            {displayState === 'pending' && (
              <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 sm:p-5 space-y-3">
                <p className="text-xs font-outfit font-bold uppercase tracking-wider text-slate-400">
                  Verification Progress
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-3 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">Application Sent</p>
                      <p className="text-[11px] text-emerald-300/80">All sections received</p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-teal-500/10 border border-teal-500/30 p-3 flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-teal-400 shrink-0 animate-pulse" />
                    <div>
                      <p className="text-xs font-bold text-white">Credential Check</p>
                      <p className="text-[11px] text-teal-300/80">In progress</p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3 flex items-center gap-2.5 opacity-75">
                    <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-200">Account Activation</p>
                      <p className="text-[11px] text-slate-400">Up next</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Incomplete State: Reviewer Note + Interactive Checklist */}
            {displayState === 'incomplete' && (
              <div className="space-y-4">
                {reviewerNote && (
                  <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-start gap-3">
                    <MessageSquareText className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1 min-w-0">
                      <p className="text-[11px] font-outfit font-bold uppercase tracking-wider text-amber-300">
                        Note from Review Team
                      </p>
                      <p className="text-sm text-amber-100/95 leading-relaxed break-words">
                        {reviewerNote}
                      </p>
                    </div>
                  </div>
                )}

                {checklist.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="w-4 h-4 text-amber-400" />
                        <h2 className="text-xs font-outfit font-bold uppercase tracking-wider text-slate-300">
                          Flagged Checklist Items
                        </h2>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        {updatedCount} of {checklist.length} updated
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {checklist.map((item) => (
                        <ChecklistCard
                          key={item.key}
                          item={item}
                          onSelect={() => router.push(buildStepHref(item.step, item.key))}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 text-sm text-slate-300">
                    Some details in your registration still need to be completed before review.
                    Continue your onboarding form to fill in the remaining sections.
                  </div>
                )}
              </div>
            )}

            {/* Rejected / Suspended Reason Callout */}
            {(displayState === 'rejected' || displayState === 'suspended') && (
              <div className="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1 min-w-0">
                  <p className="text-[11px] font-outfit font-bold uppercase tracking-wider text-rose-300">
                    {displayState === 'rejected' ? 'Review Feedback' : 'Suspension Details'}
                  </p>
                  <p className="text-sm text-rose-100/95 leading-relaxed break-words">
                    {denialReason ||
                      (displayState === 'rejected'
                        ? 'Please verify your clinical credentials, identity proof, and banking documents, then resubmit your application.'
                        : 'Please reach out to our clinical operations team for more information regarding your account status.')}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {displayState === 'incomplete' && (
                <Button
                  type="button"
                  onClick={() => router.push(primaryIncompleteHref)}
                  className="rounded-2xl h-11 px-5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm gap-2 shadow-lg shadow-amber-500/20"
                >
                  <span>Fix &amp; Resubmit</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}

              {displayState === 'rejected' && (
                <Button
                  type="button"
                  onClick={() => router.push('/onboarding')}
                  className="rounded-2xl h-11 px-5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm gap-2 shadow-lg shadow-teal-500/20"
                >
                  <span>Fix &amp; Resubmit</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}

              {displayState === 'suspended' && (
                <Button
                  asChild
                  className="rounded-2xl h-11 px-5 bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm gap-2 shadow-lg shadow-rose-500/20"
                >
                  <a href={`mailto:${SUPPORT_EMAIL}?subject=AriesXpert%20Account%20Review`}>
                    <Mail className="w-4 h-4" />
                    <span>Contact Support</span>
                  </a>
                </Button>
              )}

              {displayState === 'approved' && (
                <Button
                  type="button"
                  onClick={() => router.replace('/app')}
                  className="rounded-2xl h-11 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <span>Open Workstation</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}

              {displayState !== 'approved' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleRefresh(false)}
                  disabled={isRefreshing}
                  className="rounded-2xl h-11 px-4 border-white/15 bg-white/[0.04] hover:bg-white/10 text-white font-semibold text-sm gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Checking...' : 'Refresh Status'}</span>
                </Button>
              )}

              {(displayState === 'rejected' || displayState === 'pending' || displayState === 'incomplete') && (
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=AriesXpert%20Onboarding%20Support`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-teal-300 transition-colors ml-auto"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{SUPPORT_EMAIL}</span>
                </a>
              )}
            </div>

            {/* Footer Auto-Poll Indicator */}
            {displayState !== 'approved' && (
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <span className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <span>Status updates automatically every 15 seconds</span>
                </span>
                <span>Last checked: {lastCheckedLabel}</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusHeroIcon({ state }: { state: OnboardingDisplayState }) {
  if (state === 'approved') {
    return (
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/15">
        <Sparkles className="w-7 h-7 text-emerald-400" />
      </div>
    );
  }
  if (state === 'incomplete') {
    return (
      <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/15">
        <AlertTriangle className="w-7 h-7 text-amber-400" />
      </div>
    );
  }
  if (state === 'rejected') {
    return (
      <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/35 flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/15">
        <ShieldAlert className="w-7 h-7 text-rose-400" />
      </div>
    );
  }
  if (state === 'suspended') {
    return (
      <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/35 flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/15">
        <Ban className="w-7 h-7 text-rose-400" />
      </div>
    );
  }
  return (
    <div className="w-14 h-14 rounded-2xl bg-teal-500/15 border border-teal-500/35 flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/15">
      <Clock className="w-7 h-7 text-teal-400" />
    </div>
  );
}

function ChecklistCard({
  item,
  onSelect,
}: {
  item: ParityChecklistItem;
  onSelect: () => void;
}) {
  const isResubmitted = item.status === 'resubmitted';
  const stepTitle = ONBOARDING_STEP_TITLES[item.step] || `Step ${item.step + 1}`;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-2xl border p-4 transition-all group flex items-center justify-between gap-3 ${
        isResubmitted
          ? 'bg-emerald-500/[0.06] border-emerald-500/25 hover:border-emerald-400/50 hover:bg-emerald-500/10'
          : 'bg-white/[0.03] border-amber-500/25 hover:border-amber-400/60 hover:bg-amber-500/[0.07]'
      }`}
    >
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-200">
            Step {item.step + 1} · {stepTitle}
          </span>
          {isResubmitted ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              <CheckCircle2 className="w-3 h-3" />
              Updated
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/35 text-[10px] font-bold uppercase tracking-wider text-amber-300">
              Pending
            </span>
          )}
        </div>

        <p className="text-sm font-bold text-white group-hover:text-teal-200 transition-colors">
          {item.label}
        </p>

        {item.note && (
          <p className="text-xs text-slate-300 leading-relaxed break-words">
            {item.note}
          </p>
        )}
      </div>

      <span className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-slate-300 group-hover:text-white group-hover:translate-x-0.5 transition-all">
        <span className="hidden sm:inline">{isResubmitted ? 'Review' : 'Update'}</span>
        <ArrowRight className="w-4 h-4" />
      </span>
    </button>
  );
}

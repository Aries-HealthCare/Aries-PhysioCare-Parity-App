'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Home,
  Loader2,
  Lock,
  LogIn,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  User,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DynamicAppLogo } from '@/components/ui/dynamic-app-logo';
import { useToast } from '@/hooks/use-toast';
import {
  clearPendingDispatchToken,
  extractDispatchToken,
  mapDispatchErrorCode,
  readPendingDispatchToken,
  savePendingDispatchToken,
  type DispatchErrorMapping,
} from '@/lib/dispatch-invite';
import { ApiError } from '@/services/api-transport';
import { providerApi } from '@/services/provider-api';
import { useProviderAuth } from '@/services/provider-auth-context';

export interface DispatchClaimViewProps {
  token?: string | null;
}

type DispatchPhase =
  | 'loading'
  | 'invalid'
  | 'login'
  | 'ready'
  | 'confirmed'
  | 'declined'
  | 'error';

interface DispatchPreview {
  patientInitials: string;
  patientArea: string;
  scheduledDate: string;
  scheduledTime: string;
  condition: string;
}

interface DispatchConfirmedPii {
  fullPatientName: string;
  fullAddress: string;
}

function RedactedPreviewCard({ preview }: { preview: DispatchPreview }) {
  const scheduleLabel =
    [preview.scheduledDate, preview.scheduledTime].filter(Boolean).join(' · ') ||
    'Scheduled slot confirmed upon acceptance';

  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4 sm:p-5 space-y-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Assignment Preview
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
          <Lock className="h-3 w-3" />
          PII Redacted
        </span>
      </div>

      <dl className="grid grid-cols-1 gap-3 text-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background border border-border/60 text-primary">
            <User className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Patient</dt>
            <dd className="font-semibold text-foreground break-words">
              {preview.patientInitials}
            </dd>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background border border-border/60 text-primary">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Area</dt>
            <dd className="font-semibold text-foreground break-words">
              {preview.patientArea}
            </dd>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background border border-border/60 text-primary">
            <CalendarClock className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Scheduled Slot</dt>
            <dd className="font-semibold text-foreground break-words">
              {scheduleLabel}
            </dd>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background border border-border/60 text-primary">
            <Stethoscope className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-muted-foreground">Care Type</dt>
            <dd className="font-semibold text-foreground break-words">
              {preview.condition}
            </dd>
          </div>
        </div>
      </dl>
    </div>
  );
}

export function DispatchClaimView({ token }: DispatchClaimViewProps) {
  const { isAuthenticated, isLoading: authLoading, user } = useProviderAuth();
  const { toast } = useToast();

  const [phase, setPhase] = useState<DispatchPhase>('loading');
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [preview, setPreview] = useState<DispatchPreview | null>(null);
  const [confirmedPii, setConfirmedPii] = useState<DispatchConfirmedPii | null>(null);
  const [errorInfo, setErrorInfo] = useState<DispatchErrorMapping | null>(null);
  const [submittingAction, setSubmittingAction] = useState<'accept' | 'decline' | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  const loginNextHref = useMemo(() => {
    if (!activeToken) return '/login';
    const nextPath = `/dispatch/claim?token=${activeToken}`;
    return `/login?next=${encodeURIComponent(nextPath)}`;
  }, [activeToken]);

  const switchAccountHref = useMemo(() => {
    if (!activeToken) return '/login?force=1';
    const nextPath = `/dispatch/claim?token=${activeToken}`;
    return `/login?force=1&next=${encodeURIComponent(nextPath)}`;
  }, [activeToken]);

  useEffect(() => {
    if (authLoading) {
      setPhase('loading');
      return;
    }

    let cancelled = false;

    const bootstrap = async () => {
      const hasExplicitToken = typeof token === 'string' && token.trim().length > 0;
      const validToken = hasExplicitToken
        ? extractDispatchToken({ tokenParam: token })
        : readPendingDispatchToken();

      if (!validToken) {
        if (!cancelled) {
          setActiveToken(null);
          setPreview(null);
          setConfirmedPii(null);
          setErrorInfo(null);
          setPhase('invalid');
        }
        return;
      }

      if (!cancelled) {
        setActiveToken(validToken);
        setPhase('loading');
        setErrorInfo(null);
        setConfirmedPii(null);
      }

      const storedJwt = providerApi.getToken();
      const isSignedIn = Boolean(isAuthenticated || (storedJwt && storedJwt.length > 20));

      try {
        const res = await providerApi.previewDispatchInvite(validToken);
        if (cancelled) return;

        if (res.booking && typeof res.booking === 'object') {
          setPreview({
            patientInitials: res.booking.patientInitials || 'P.',
            patientArea: res.booking.patientArea || 'Area disclosed upon acceptance',
            scheduledDate: res.booking.scheduledDate || '',
            scheduledTime: res.booking.scheduledTime || '',
            condition: res.booking.condition || 'Physiotherapy visit',
          });

          if (isSignedIn) {
            setPhase('ready');
          } else {
            savePendingDispatchToken(validToken);
            setPhase('login');
          }
          return;
        }

        const mapped = mapDispatchErrorCode(res.message || 'DISPATCH_EXPIRED', res.message);
        if (mapped.requiresLogin) {
          savePendingDispatchToken(validToken);
          setErrorInfo(mapped);
          setPhase('login');
        } else {
          setErrorInfo(mapped);
          setPhase('error');
        }
      } catch (err: unknown) {
        if (cancelled) return;

        if (err instanceof ApiError && err.statusCode === 401) {
          savePendingDispatchToken(validToken);
          setErrorInfo(mapDispatchErrorCode('DISPATCH_SESSION_EXPIRED'));
          setPhase('login');
          return;
        }

        const rawCode =
          err instanceof ApiError
            ? err.code || err.message
            : err instanceof Error
              ? err.message
              : undefined;
        const fallback = err instanceof Error ? err.message : undefined;
        const mapped = mapDispatchErrorCode(rawCode, fallback);

        if (mapped.requiresLogin) {
          savePendingDispatchToken(validToken);
          setErrorInfo(mapped);
          setPhase('login');
        } else {
          setErrorInfo(mapped);
          setPhase('error');
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [token, authLoading, isAuthenticated, reloadTick]);

  const handleDecision = async (action: 'accept' | 'decline') => {
    if (submittingAction || !activeToken) return;

    setSubmittingAction(action);
    setErrorInfo(null);

    try {
      if (action === 'accept') {
        const res = await providerApi.acceptDispatchInvite(activeToken);
        if (res.success !== true) {
          const mapped = mapDispatchErrorCode(res.message, res.message);
          if (mapped.requiresLogin) {
            savePendingDispatchToken(activeToken);
            setErrorInfo(mapped);
            setPhase('login');
          } else {
            setErrorInfo(mapped);
            setPhase('error');
          }
          return;
        }

        clearPendingDispatchToken();
        setConfirmedPii({
          fullPatientName: res.booking?.fullPatientName || 'Patient name unavailable',
          fullAddress: res.booking?.fullAddress || '',
        });
        setPhase('confirmed');
        toast({
          title: 'Visit Assignment Confirmed',
          description: res.idempotent
            ? 'This visit was already confirmed on your schedule.'
            : 'You have claimed this visit. Full patient details are now unlocked.',
        });
      } else {
        const res = await providerApi.declineDispatchInvite(activeToken);
        if (res.success !== true) {
          const mapped = mapDispatchErrorCode(res.message, res.message);
          if (mapped.requiresLogin) {
            savePendingDispatchToken(activeToken);
            setErrorInfo(mapped);
            setPhase('login');
          } else {
            setErrorInfo(mapped);
            setPhase('error');
          }
          return;
        }

        clearPendingDispatchToken();
        setPhase('declined');
        toast({
          title: 'Invitation Declined',
          description: 'Dispatch has been notified so another eligible clinician can assist.',
        });
      }
    } catch (err: unknown) {
      if (err instanceof ApiError && err.statusCode === 401) {
        savePendingDispatchToken(activeToken);
        setErrorInfo(mapDispatchErrorCode('DISPATCH_SESSION_EXPIRED'));
        setPhase('login');
        return;
      }

      const rawCode =
        err instanceof ApiError
          ? err.code || err.message
          : err instanceof Error
            ? err.message
            : undefined;
      const fallback = err instanceof Error ? err.message : undefined;
      const mapped = mapDispatchErrorCode(rawCode, fallback);

      if (mapped.requiresLogin) {
        savePendingDispatchToken(activeToken);
        setErrorInfo(mapped);
        setPhase('login');
      } else {
        setErrorInfo(mapped);
        setPhase('error');
      }
    } finally {
      setSubmittingAction(null);
    }
  };

  const clinicianDisplayName = user?.fullName || user?.name || '';

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col justify-center px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
      <div className="w-full max-w-lg mx-auto space-y-5">
        {/* Top Brand Header */}
        <div className="flex items-center justify-between gap-3">
          <Link href="/app" className="inline-flex items-center focus:outline-none">
            <DynamicAppLogo size={40} showText />
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Verified Dispatch
          </span>
        </div>

        {/* Main Elevated Card */}
        <Card className="rounded-2xl border-border/80 shadow-xl overflow-hidden">
          <CardHeader className="space-y-2 pb-4 border-b border-border/60 bg-card">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-lg sm:text-xl font-bold leading-snug">
                  Secure Visit Assignment
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {clinicianDisplayName
                    ? `Signed in as ${clinicianDisplayName}`
                    : 'AriesXpert Clinician Dispatch Portal'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 space-y-5">
            {/* LOADING PHASE */}
            {phase === 'loading' && (
              <div className="space-y-4" role="status" aria-label="Loading visit assignment">
                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="h-3.5 w-28 rounded bg-muted-foreground/20" />
                    <div className="h-5 w-20 rounded-full bg-muted-foreground/20" />
                  </div>
                  <div className="space-y-3 pt-1">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-muted-foreground/20 shrink-0" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-2.5 w-16 rounded bg-muted-foreground/20" />
                          <div className="h-4 w-40 rounded bg-muted-foreground/20" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>Verifying assignment invitation…</span>
                </div>
              </div>
            )}

            {/* INVALID TOKEN PHASE */}
            {phase === 'invalid' && (
              <div className="space-y-5">
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div className="space-y-1 min-w-0">
                    <h2 className="text-sm font-semibold text-foreground">
                      Invalid Invitation Link
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      This invitation link is missing or not valid. Please open the complete
                      assignment link sent to you by AriesXpert Dispatch.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild className="w-full min-h-[44px]">
                    <Link href="/app">
                      <Home className="h-4 w-4" />
                      Go to Dashboard
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full min-h-[44px]">
                    <Link href="/login">
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* LOGIN PHASE */}
            {phase === 'login' && (
              <div className="space-y-5">
                <div className="rounded-xl border border-primary/25 bg-primary/5 p-3.5 flex items-start gap-3">
                  <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                    This invite link identifies the assignment only. Sign in with your verified
                    therapist account to accept or decline.
                  </p>
                </div>

                {errorInfo && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-foreground">
                        {errorInfo.title}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {errorInfo.message}
                      </p>
                    </div>
                  </div>
                )}

                {preview && <RedactedPreviewCard preview={preview} />}

                <Button
                  asChild
                  size="lg"
                  className="w-full min-h-[44px] font-semibold"
                  onClick={() => {
                    if (activeToken) savePendingDispatchToken(activeToken);
                  }}
                >
                  <Link href={loginNextHref}>
                    <LogIn className="h-4 w-4" />
                    Sign in to continue
                  </Link>
                </Button>
              </div>
            )}

            {/* READY PHASE */}
            {phase === 'ready' && (
              <div className="space-y-5">
                {preview && <RedactedPreviewCard preview={preview} />}

                <div className="rounded-xl border border-primary/25 bg-primary/5 p-3.5 flex items-start gap-3">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                    The invitation link identifies this assignment only. Accepting verifies your
                    therapist account and claims the visit atomically.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    size="lg"
                    className="w-full min-h-[44px] font-semibold"
                    disabled={submittingAction !== null}
                    onClick={() => void handleDecision('accept')}
                  >
                    {submittingAction === 'accept' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Accept Visit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full min-h-[44px] font-semibold"
                    disabled={submittingAction !== null}
                    onClick={() => void handleDecision('decline')}
                  >
                    {submittingAction === 'decline' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    Decline Visit
                  </Button>
                </div>

                {submittingAction !== null && (
                  <div
                    className="flex items-center justify-center gap-2 text-xs text-muted-foreground"
                    role="status"
                  >
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    <span>Submitting your decision…</span>
                  </div>
                )}
              </div>
            )}

            {/* CONFIRMED PHASE */}
            {phase === 'confirmed' && (
              <div className="space-y-5">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:p-5 space-y-3">
                  <div className="flex items-center gap-2.5 text-emerald-500">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <h2 className="text-sm sm:text-base font-bold text-foreground">
                      Server-Confirmed Assignment
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground">
                    This visit is now assigned to your clinician schedule. Full patient details are
                    shown below.
                  </p>

                  <div className="rounded-lg border border-border/60 bg-background/80 p-3.5 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <User className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          Patient Name
                        </p>
                        <p className="text-sm font-semibold text-foreground break-words">
                          {confirmedPii?.fullPatientName || 'Patient name unavailable'}
                        </p>
                      </div>
                    </div>

                    {confirmedPii?.fullAddress ? (
                      <div className="flex items-start gap-2.5">
                        <MapPin className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                            Visit Address
                          </p>
                          <p className="text-sm text-foreground break-words">
                            {confirmedPii.fullAddress}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {preview && (preview.scheduledDate || preview.scheduledTime) ? (
                      <div className="flex items-start gap-2.5">
                        <CalendarClock className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                            Scheduled Slot
                          </p>
                          <p className="text-sm text-foreground break-words">
                            {[preview.scheduledDate, preview.scheduledTime]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild size="lg" className="w-full min-h-[44px] font-semibold">
                    <Link href="/app/appointments">
                      <ClipboardList className="h-4 w-4" />
                      View Appointments
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full min-h-[44px] font-semibold"
                  >
                    <Link href="/app/visits">
                      Go to Visits
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* DECLINED PHASE */}
            {phase === 'declined' && (
              <div className="space-y-5">
                <div className="rounded-xl border border-border bg-muted/40 p-4 sm:p-5 space-y-2">
                  <div className="flex items-center gap-2.5">
                    <XCircle className="h-5 w-5 text-muted-foreground shrink-0" />
                    <h2 className="text-sm sm:text-base font-semibold text-foreground">
                      Invitation Declined
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    You declined this invitation. Dispatch can offer it to another eligible
                    clinician.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild size="lg" className="w-full min-h-[44px] font-semibold">
                    <Link href="/app/leads">
                      Browse Available Leads
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full min-h-[44px]"
                  >
                    <Link href="/app">
                      <Home className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* ERROR PHASE */}
            {phase === 'error' && (
              <div className="space-y-5">
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 sm:p-5 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div className="space-y-1 min-w-0">
                    <h2 className="text-sm sm:text-base font-semibold text-foreground">
                      {errorInfo?.title || 'Unable to Process Assignment'}
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {errorInfo?.message ||
                        'We could not process this visit assignment right now. Please try again.'}
                    </p>
                  </div>
                </div>

                {preview && <RedactedPreviewCard preview={preview} />}

                <div className="flex flex-col sm:flex-row gap-3">
                  {errorInfo?.title === 'Not Authorized' ? (
                    <Button asChild size="lg" className="w-full min-h-[44px] font-semibold">
                      <Link href={switchAccountHref}>
                        <LogIn className="h-4 w-4" />
                        Switch Account
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild size="lg" className="w-full min-h-[44px] font-semibold">
                      <Link href="/app/leads">
                        View Leads Inbox
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full min-h-[44px]"
                    onClick={() => setReloadTick((n) => n + 1)}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </Button>
                </div>

                <div className="text-center">
                  <Link
                    href="/app"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Home className="h-3.5 w-3.5" />
                    Back to Clinician Dashboard
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

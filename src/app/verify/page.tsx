'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProviderAuth } from '@/services/provider-auth-context';
import { sendProviderOtp } from '@/services/provider-api';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, RefreshCw, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get('phone') || '';
  const { user, loginWithPhoneOtp } = useProviderAuth();
  const [mobileNumber, setMobileNumber] = useState(phoneParam || user?.phone || user?.mobileNo || '');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(45);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = async () => {
    if (timer > 0 || !mobileNumber) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await sendProviderOtp(mobileNumber);
      if (!res.success) {
        setErrorMessage(res.message || 'Could not resend the verification code.');
        return;
      }
      setTimer(45);
      setSuccessMessage(res.message || 'A new code was sent.');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not resend the verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber) {
      setErrorMessage('Enter the mobile number this code was sent to.');
      return;
    }
    if (otp.length < 4) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      const success = await loginWithPhoneOtp(mobileNumber, otp);
      if (!success) {
        setErrorMessage('Invalid verification code. Please check and retry.');
        return;
      }
      setSuccessMessage('Mobile verified. Continuing…');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-muted/20 to-primary/5 flex flex-col justify-between py-6 px-4">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <Image src="/logo-light.png" alt="AriesXpert" width={180} height={48} className="h-12 w-auto" />
        </Link>
        <Link href="/login" className="text-xs font-semibold text-muted-foreground hover:text-primary flex items-center gap-1" prefetch={false}>
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto my-8">
        <div className="bg-card border border-border/80 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-3">
              <Smartphone className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-outfit font-extrabold">Verify your mobile</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Enter the 6-digit code sent to {mobileNumber || 'your registered number'}.
            </p>
          </div>

          {errorMessage ? (
            <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          ) : null}
          {successMessage ? (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          ) : null}

          <form onSubmit={handleVerify} className="space-y-4">
            {!phoneParam && !user?.phone ? (
              <div>
                <Label htmlFor="phone">Mobile number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  className="h-12 rounded-2xl mt-1.5"
                  required
                />
              </div>
            ) : null}
            <div>
              <Label htmlFor="otp">6-digit verification code</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="••••••"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-[0.3em] font-mono h-14 rounded-2xl mt-1.5"
                autoFocus
                required
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Didn&apos;t receive SMS?</span>
              {timer > 0 ? (
                <span className="font-mono text-muted-foreground">Resend in {timer}s</span>
              ) : (
                <button type="button" onClick={handleResend} disabled={isLoading} className="font-bold text-primary flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  Resend OTP
                </button>
              )}
            </div>
            <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-2xl">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify and continue'}
            </Button>
          </form>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground">AriesXpert expert workstation</p>
    </div>
  );
}

export default function ProviderVerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <VerifyContent />
    </Suspense>
  );
}

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';
import {
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  UserPlus,
  Stethoscope,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CountrySelector, COUNTRIES_CONFIG } from '@/components/country-selector';
import { motion, AnimatePresence } from 'framer-motion';
import { Login3DBackground } from './login-3d-background';

type ScreenMode = 'mobile' | 'email' | 'otp' | 'reset';

const SCREEN_ORDER: ScreenMode[] = ['mobile', 'otp', 'email', 'reset'];

export function LoginPortal() {
  const router = useRouter();
  const { user, loginWithPhoneOtp, loginWithEmail, isAuthenticated } = useProviderAuth();

  const [currentScreen, setCurrentScreen] = useState<ScreenMode>('mobile');
  const [screenDirection, setScreenDirection] = useState<1 | -1>(1);
  const [selectedCountry, setSelectedCountry] = useState('India');

  // Mobile & OTP State
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Email & Password State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & Feedback State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const currentCountry = COUNTRIES_CONFIG[selectedCountry] || COUNTRIES_CONFIG['India'];

  // ── Navigate between screens ──
  const navigateTo = useCallback((screen: ScreenMode) => {
    const curr = SCREEN_ORDER.indexOf(currentScreen);
    const next = SCREEN_ORDER.indexOf(screen);
    setScreenDirection(next >= curr ? 1 : -1);
    setCurrentScreen(screen);
    setErrorMessage('');
  }, [currentScreen]);

  // ── Load cached credentials ──
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedEmail = localStorage.getItem('cached_login_email') || '';
        if (savedEmail) { setEmail(savedEmail); setRememberMe(true); }
        const savedPhone = localStorage.getItem('cached_login_phone') || '';
        if (savedPhone) setMobileNumber(savedPhone);
      } catch (_) {}
    }
  }, []);

  // ── OTP Countdown Timer ──
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    } else if (resendTimer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, resendTimer]);

  // ── 1. Send OTP Handler ──
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanNumber = mobileNumber.replace(/\D/g, '');
    const requiredLength = currentCountry.phoneLength || 10;

    if (cleanNumber.length !== requiredLength) {
      setErrorMessage(`Please enter a valid ${requiredLength}-digit phone number`);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const fullPhone = `${currentCountry.dialCode}${cleanNumber}`;
      const res = await providerApi.sendOTP(fullPhone);

      if (res.success) {
        if (rememberMe) {
          try { localStorage.setItem('cached_login_phone', cleanNumber); } catch (_) {}
        }
        setSuccessMessage('Verification code sent successfully!');
        setOtp(['', '', '', '', '', '']);
        setResendTimer(30);
        setIsTimerActive(true);
        navigateTo('otp');
        setTimeout(() => otpRefs.current[0]?.focus(), 150);
      } else {
        setErrorMessage(res.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── 2. Verify OTP Handler ──
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const cleanNumber = mobileNumber.replace(/\D/g, '');
      const fullPhone = `${currentCountry.dialCode}${cleanNumber}`;
      const success = await loginWithPhoneOtp(fullPhone, otpValue);

      if (success) {
        setSuccessMessage('Verification successful! Welcome back.');
      } else {
        setErrorMessage('Invalid verification code. Please check and retry.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── 3. Email & Password Login Handler ──
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      if (rememberMe) {
        try { localStorage.setItem('cached_login_email', email); } catch (_) {}
      } else {
        try { localStorage.removeItem('cached_login_email'); } catch (_) {}
      }

      const success = await loginWithEmail(email, password);
      if (success) {
        setSuccessMessage('Authenticated successfully! Redirecting...');
      } else {
        setErrorMessage('Invalid credentials. Please verify your email and password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── 4. OTP Input Change & Keydown ──
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) newOtp[i] = pasted[i] || '';
    setOtp(newOtp);
    const nextIndex = Math.min(pasted.length, 5);
    otpRefs.current[nextIndex]?.focus();
  };

  // ── 5. Password Reset Handler ──
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      setSuccessMessage('Password recovery instructions sent to your email.');
      setTimeout(() => navigateTo('email'), 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send recovery instructions.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] text-white flex flex-col justify-between relative overflow-hidden select-none font-sans py-8 px-4 sm:px-6">
      {/* ── Unified 3D Background ── */}
      <Login3DBackground />

      <div className="h-1 sm:h-2" />

      {/* ── Center Stage Container ── */}
      <main className="relative z-10 max-w-md w-full mx-auto my-auto flex flex-col items-center">
        {/* ── Brand Header ── */}
        <div className="text-center space-y-3 mb-6 relative">
          {/* Logo Emblem */}
          <div className="w-20 h-20 sm:w-22 sm:h-22 mx-auto relative flex items-center justify-center">
            <div className="w-full h-full rounded-2xl p-1 bg-gradient-to-tr from-teal-500/30 to-emerald-500/20 border border-teal-500/30 shadow-lg shadow-teal-950/50 backdrop-blur-xl flex items-center justify-center">
              <div className="w-full h-full rounded-xl overflow-hidden relative flex items-center justify-center">
                <Image
                  src="/aries-gold-emblem.png"
                  alt="Aries Emblem"
                  fill
                  sizes="88px"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-teal-500 text-slate-950 shadow-md ring-2 ring-[#030712]">
                <Sparkles className="w-3 h-3 fill-slate-950" />
              </div>
            </div>
          </div>

          {/* Titles */}
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
              <span>Aries</span>
              <span className="text-teal-400">Xpert</span>
            </h1>

            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-400 text-[10px] font-bold uppercase tracking-widest font-mono">
              <ShieldCheck className="w-3 h-3" />
              <span>CLINICAL SPECIALIST PORTAL</span>
            </div>
          </div>
        </div>

        {/* ── Main Interactive Card ── */}
        <div className="w-full rounded-3xl p-[1px] bg-gradient-to-b from-teal-500/30 via-white/10 to-transparent shadow-2xl">
          <div className="w-full rounded-[calc(1.5rem-1px)] bg-[#0a0f1d]/90 backdrop-blur-2xl p-6 sm:p-7 space-y-5 border border-white/5">
            {/* Status Feedback */}
            <AnimatePresence mode="wait">
              {errorMessage && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs font-semibold flex items-center gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs font-semibold flex items-center gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Session Indicator */}
            {isAuthenticated && user && (
              <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <div className="truncate text-xs text-slate-300">
                    Active: <span className="font-bold text-white">{user.fullName || user.phone || 'Provider'}</span>
                  </div>
                </div>
                <Link
                  href="/app"
                  className="shrink-0 px-3 py-1 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 transition-colors"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {/* ── Screen Navigation Area ── */}
            <AnimatePresence custom={screenDirection} mode="wait">
              {/* ── Screen 1: Mobile Phone Login ── */}
              {currentScreen === 'mobile' && (
                <motion.div
                  key="mobile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Tab Selector */}
                  <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950/80 border border-white/10">
                    <button
                      type="button"
                      onClick={() => navigateTo('mobile')}
                      className="py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all bg-teal-500 text-slate-950 shadow-md"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Phone OTP</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateTo('email')}
                      className="py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all text-slate-400 hover:text-white"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Password</span>
                    </button>
                  </div>

                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-300">Mobile Number</Label>
                      <div className="flex gap-2">
                        <CountrySelector
                          selectedCountry={selectedCountry}
                          onSelectCountry={setSelectedCountry}
                          compact
                          className="h-12 w-[105px] bg-slate-950/70 border-white/10 hover:border-teal-500/50 rounded-2xl text-white font-mono text-xs"
                        />
                        <div className="relative flex-1">
                          <Input
                            type="tel"
                            placeholder="Enter 10-digit number"
                            value={mobileNumber}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, currentCountry.phoneLength || 10);
                              setMobileNumber(val);
                            }}
                            className="h-12 bg-slate-950/70 border-white/10 hover:border-teal-500/50 focus:border-teal-400 text-white placeholder:text-slate-500 rounded-2xl font-mono text-sm tracking-wider font-semibold shadow-inner"
                            required
                            autoFocus
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-slate-950 text-teal-500 focus:ring-teal-500/40"
                        />
                        <span>Remember on this device</span>
                      </label>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                          <span>Generating Secure OTP...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span>Send Verification OTP</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* ── Screen 2: OTP Verification ── */}
              {currentScreen === 'otp' && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => navigateTo('mobile')}
                      className="inline-flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 font-semibold"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Change Number</span>
                    </button>
                    <span className="text-xs text-slate-400 font-mono">
                      {currentCountry.dialCode} {mobileNumber}
                    </span>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-2 text-center">
                      <Label className="text-xs font-semibold text-slate-300">
                        Enter 6-Digit Passcode
                      </Label>

                      <div className="flex justify-center gap-2 sm:gap-2.5">
                        {otp.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => { otpRefs.current[idx] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            onPaste={idx === 0 ? handleOtpPaste : undefined}
                            className="w-11 h-13 sm:h-14 text-center text-xl font-black font-mono rounded-2xl bg-slate-950/80 border border-white/10 hover:border-teal-500/50 focus:border-teal-400 text-white outline-none transition-colors"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-center text-xs">
                      {isTimerActive ? (
                        <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                          <RefreshCw className="w-3 h-3 animate-spin text-teal-400" />
                          <span>Resend OTP in 0:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}s</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendOtp()}
                          disabled={isLoading}
                          className="text-teal-400 hover:text-teal-300 font-bold underline underline-offset-4"
                        >
                          Didn't receive code? Resend OTP
                        </button>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || otp.join('').length !== 6}
                      className="w-full h-12 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                          <span>Validating Credentials...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span>Authenticate &amp; Enter</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* ── Screen 3: Email & Password ── */}
              {currentScreen === 'email' && (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Tab Selector */}
                  <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950/80 border border-white/10">
                    <button
                      type="button"
                      onClick={() => navigateTo('mobile')}
                      className="py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all text-slate-400 hover:text-white"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Phone OTP</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateTo('email')}
                      className="py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all bg-teal-500 text-slate-950 shadow-md"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Password</span>
                    </button>
                  </div>

                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-300">Registered Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <Input
                          type="email"
                          placeholder="doctor@ariesphysiocare.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 pl-10 bg-slate-950/70 border-white/10 hover:border-teal-500/50 focus:border-teal-400 text-white placeholder:text-slate-500 rounded-2xl text-sm"
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-slate-300">Password</Label>
                        <button
                          type="button"
                          onClick={() => navigateTo('reset')}
                          className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 pl-10 pr-10 bg-slate-950/70 border-white/10 hover:border-teal-500/50 focus:border-teal-400 text-white placeholder:text-slate-500 rounded-2xl text-sm font-mono"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-slate-950 text-teal-500 focus:ring-teal-500/40"
                        />
                        <span>Remember credentials</span>
                      </label>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                          <span>Verifying Credentials...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span>Sign In to Specialist Portal</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* ── Screen 4: Password Reset ── */}
              {currentScreen === 'reset' && (
                <motion.div
                  key="reset"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => navigateTo('email')}
                      className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-semibold"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </button>
                    <span className="text-xs text-slate-400 font-bold">Account Recovery</span>
                  </div>

                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-300">Registered Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <Input
                          type="email"
                          placeholder="doctor@ariesphysiocare.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 pl-10 bg-slate-950/70 border-white/10 hover:border-teal-500/50 focus:border-teal-400 text-white placeholder:text-slate-500 rounded-2xl text-sm"
                          required
                          autoFocus
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        We will send password recovery instructions to your clinical email.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                          <span>Dispatching Instructions...</span>
                        </div>
                      ) : (
                        <span>Send Recovery Email</span>
                      )}
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Register as Expert CTA Row ── */}
            <div className="pt-2">
              <Link
                href="/onboarding"
                className="flex items-center justify-between gap-3 w-full rounded-2xl bg-slate-950/60 hover:bg-slate-950/90 border border-teal-500/20 hover:border-teal-500/40 px-4 py-3 group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4 h-4 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">New to Aries Xpert?</p>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5">Join as a Clinical Expert</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-teal-400 text-xs font-bold">
                  <span>Register</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </div>

            {/* ── Practitioner Clinical Support ── */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
              <span>Clinical Support:</span>
              <a
                href="tel:+919876543210"
                className="font-bold text-teal-400 hover:text-teal-300 font-mono transition-colors"
              >
                +91 99990 00000
              </a>
            </div>
          </div>
        </div>

        {/* ── Footer Links ── */}
        <div className="mt-6 flex flex-col items-center gap-2 text-center text-xs text-slate-400">
          <div className="flex items-center gap-3 text-[11px]">
            <Link href="/privacy-policy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms-of-service" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <a href="mailto:support@ariesphysiocare.com" className="hover:text-slate-300 transition-colors">
              Help Desk
            </a>
          </div>

          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} Aries PhysioCare Inc. HIPAA &amp; ISO 27001 Certified.
          </p>
        </div>
      </main>

      <div className="h-1 sm:h-2" />
    </div>
  );
}

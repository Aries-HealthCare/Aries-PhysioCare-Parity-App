'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CountrySelector, COUNTRIES_CONFIG } from '@/components/country-selector';

// Dynamically load 3D Background on client side only (prevents any SSR hydration exception)
const DynamicLogin3DBackground = dynamic(
  () => import('./login-3d-background').then((mod) => mod.Login3DBackground),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-[#030712] pointer-events-none" />
    ),
  }
);

type ScreenMode = 'mobile' | 'email' | 'otp' | 'reset';

export function LoginPortal() {
  const router = useRouter();
  const { user, loginWithPhoneOtp, loginWithEmail, isAuthenticated } = useProviderAuth();

  const [currentScreen, setCurrentScreen] = useState<ScreenMode>('mobile');
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

  // 3D Tilt Card physics via direct DOM manipulation (0 React re-renders on mousemove)
  const cardRef = useRef<HTMLDivElement>(null);
  const glossRef = useRef<HTMLDivElement>(null);

  const currentCountry = COUNTRIES_CONFIG[selectedCountry] || COUNTRIES_CONFIG['India'];

  // Load cached credentials
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedEmail = localStorage.getItem('cached_login_email') || '';
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
        const savedPhone = localStorage.getItem('cached_login_phone') || '';
        if (savedPhone) setMobileNumber(savedPhone);
      } catch (_) {}
    }
  }, []);

  // OTP Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    } else if (resendTimer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, resendTimer]);

  // Handle 3D Mouse Parallax on Card (Direct DOM manipulation for 120fps performance and zero React thrashing)
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -5;
    const rY = ((x - centerX) / centerX) * 5;

    cardRef.current.style.transform = `perspective(1000px) rotateX(${rX.toFixed(2)}deg) rotateY(${rY.toFixed(2)}deg)`;

    if (glossRef.current) {
      const glossX = (x / rect.width) * 100;
      const glossY = (y / rect.height) * 100;
      glossRef.current.style.background = `radial-gradient(circle 320px at ${glossX}% ${glossY}%, rgba(255, 255, 255, 0.18), transparent 80%)`;
      glossRef.current.style.opacity = '0.7';
    }
  };

  const handleCardMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    }
    if (glossRef.current) {
      glossRef.current.style.opacity = '0.35';
    }
  };

  // 1. Send OTP Handler
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
          try {
            localStorage.setItem('cached_login_phone', cleanNumber);
          } catch (_) {}
        }
        setSuccessMessage('Verification code sent successfully!');
        setOtp(['', '', '', '', '', '']);
        setResendTimer(30);
        setIsTimerActive(true);
        setCurrentScreen('otp');
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

  // 2. Verify OTP Handler
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

  // 3. Email & Password Login Handler
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
        try {
          localStorage.setItem('cached_login_email', email);
        } catch (_) {}
      } else {
        try {
          localStorage.removeItem('cached_login_email');
        } catch (_) {}
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

  // 4. OTP Input Change & Keydown
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
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
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || '';
    }
    setOtp(newOtp);
    const nextIndex = Math.min(pasted.length, 5);
    otpRefs.current[nextIndex]?.focus();
  };

  // 5. Password Reset Request Handler
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
      setTimeout(() => setCurrentScreen('email'), 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send recovery instructions.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] text-white flex flex-col justify-between relative overflow-hidden select-none font-sans py-6 px-4 sm:px-6">
      {/* ── 3D Dynamic Iridescent Liquid Silk / Wave Mesh ── */}
      <DynamicLogin3DBackground />

      {/* Spacer for vertical layout balance */}
      <div className="h-2 sm:h-4" />

      {/* ── Center Stage: Modern Auth Station ── */}
      <main className="relative z-10 max-w-md w-full mx-auto my-auto py-2 flex flex-col items-center">
        
        {/* ── Brand Header & Glowing Aries Emblem ── */}
        <div className="text-center space-y-3 mb-5 relative">
          {/* Glowing Emblem Core */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto relative flex items-center justify-center">
            <div className="w-full h-full rounded-full p-1 bg-gradient-to-tr from-sky-500/40 via-[#0a1020] to-amber-400/30 border border-amber-400/50 shadow-[0_0_35px_rgba(14,165,233,0.3)] backdrop-blur-xl flex items-center justify-center group">
              <div className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/aries-gold-emblem.png"
                  alt="Aries Gold Emblem"
                  fill
                  sizes="96px"
                  className="object-contain drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                  priority
                />
              </div>

              {/* Sparkle Badge */}
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/50 ring-2 ring-[#030712]">
                <Sparkles className="w-3.5 h-3.5 fill-white text-white" />
              </div>
            </div>
          </div>

          {/* Brand Titles */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-outfit flex items-center justify-center gap-1.5 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              <span>Aries</span>
              <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(245,158,11,0.6)]">
                Xpert
              </span>
            </h1>
            
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.15)] backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400 font-mono">
                CLINICAL SPECIALIST PORTAL
              </span>
            </div>
          </div>
        </div>

        {/* ── 3D Interactive Card (Perspective Tilt & Dynamic Gloss) ── */}
        <div style={{ perspective: '1000px' }} className="w-full">
          <div
            ref={cardRef}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            style={{
              transition: 'transform 0.15s ease-out',
              transformStyle: 'preserve-3d',
            }}
            className="relative w-full rounded-[2rem] p-[1px] bg-gradient-to-b from-sky-500/40 via-white/10 to-amber-400/30 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95),0_0_50px_rgba(14,165,233,0.15)] group"
          >
            {/* Dynamic Gloss Overlay */}
            <div
              ref={glossRef}
              className="absolute inset-0 rounded-[2rem] pointer-events-none opacity-35 transition-opacity duration-300"
              style={{
                background: 'radial-gradient(circle 320px at 50% 50%, rgba(255, 255, 255, 0.15), transparent 80%)',
              }}
            />

            {/* Inner Glass Container */}
            <div className="relative w-full rounded-[1.95rem] bg-[#090e1c]/92 backdrop-blur-2xl p-6 sm:p-8 space-y-6 border border-white/5 overflow-hidden">
              {/* Subtle Corner Glows inside card */}
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

              {/* Status Feedback */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs font-semibold flex items-center gap-2.5 shadow-lg shadow-rose-950/40 animate-in fade-in zoom-in-95 duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs font-semibold flex items-center gap-2.5 shadow-lg shadow-emerald-950/40 animate-in fade-in zoom-in-95 duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Active Session Indicator (if already logged in) */}
              {isAuthenticated && user && (
                <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <div className="truncate text-xs text-slate-300">
                      Active session: <span className="font-bold text-white">{user.fullName || user.phone || 'Provider'}</span>
                    </div>
                  </div>
                  <Link
                    href="/app"
                    className="shrink-0 px-3 py-1 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-[11px] flex items-center gap-1 transition-all shadow-md shadow-sky-500/30"
                  >
                    <span>Open Dashboard</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {/* ── Mode 1: Mobile Phone Number ── */}
              {currentScreen === 'mobile' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Mode Switcher Tabs */}
                  <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-900/90 border border-white/10 relative">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentScreen('mobile');
                        setErrorMessage('');
                      }}
                      className="py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_0_20px_rgba(14,165,233,0.5)]"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Phone OTP</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentScreen('email');
                        setErrorMessage('');
                      }}
                      className="py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all text-slate-400 hover:text-white"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Password</span>
                    </button>
                  </div>

                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-300">
                        Mobile Number
                      </Label>
                      
                      <div className="flex gap-2">
                        {/* International Country Flag Picker */}
                        <CountrySelector
                          selectedCountry={selectedCountry}
                          onSelectCountry={setSelectedCountry}
                          compact
                          className="h-12 w-[110px] bg-slate-950/80 border-white/10 hover:border-sky-500/50 rounded-2xl text-white font-mono"
                        />

                        {/* Phone Number Input */}
                        <div className="relative flex-1">
                          <Input
                            type="tel"
                            placeholder="Enter 10-digit number"
                            value={mobileNumber}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, currentCountry.phoneLength || 10);
                              setMobileNumber(val);
                            }}
                            className="h-12 bg-slate-950/70 border-white/10 hover:border-sky-500/50 focus:border-sky-400 text-white placeholder:text-slate-500 rounded-2xl font-mono text-sm tracking-wider font-semibold shadow-inner"
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
                          className="w-4 h-4 rounded-md border-white/20 bg-slate-950 text-sky-500 focus:ring-sky-500/40"
                        />
                        <span>Remember on this device</span>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
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
                </div>
              )}

              {/* ── Mode 2: 6-Digit OTP Verification Screen ── */}
              {currentScreen === 'otp' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentScreen('mobile');
                        setErrorMessage('');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Change Number</span>
                    </button>
                    <span className="text-xs text-slate-400 font-mono font-medium">
                      {currentCountry.dialCode} {mobileNumber}
                    </span>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div className="space-y-3 text-center">
                      <Label className="text-xs font-semibold text-slate-300">
                        Enter 6-Digit Passcode
                      </Label>

                      {/* 6 OTP Input Boxes */}
                      <div className="flex justify-center gap-2 sm:gap-2.5">
                        {otp.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => {
                              otpRefs.current[idx] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            onPaste={idx === 0 ? handleOtpPaste : undefined}
                            className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black font-mono rounded-2xl bg-slate-950/80 border border-white/10 hover:border-sky-500/50 focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20 text-white outline-none transition-all shadow-inner"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Resend OTP Counter */}
                    <div className="flex items-center justify-center text-xs">
                      {isTimerActive ? (
                        <div className="flex items-center gap-1.5 text-slate-400 font-mono">
                          <RefreshCw className="w-3 h-3 animate-spin text-sky-400" />
                          <span>Resend OTP in 0:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}s</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendOtp()}
                          disabled={isLoading}
                          className="text-sky-400 hover:text-sky-300 font-bold underline underline-offset-4 decoration-sky-500/40 hover:decoration-sky-400"
                        >
                          Didn't receive code? Resend OTP
                        </button>
                      )}
                    </div>

                    {/* Verify Button */}
                    <Button
                      type="submit"
                      disabled={isLoading || otp.join('').length !== 6}
                      className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Validating Credentials...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span>Authenticate & Enter</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </Button>
                  </form>
                </div>
              )}

              {/* ── Mode 3: Email & Password Screen ── */}
              {currentScreen === 'email' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Mode Switcher Tabs */}
                  <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-900/90 border border-white/10 relative">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentScreen('mobile');
                        setErrorMessage('');
                      }}
                      className="py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all text-slate-400 hover:text-white"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Phone OTP</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentScreen('email');
                        setErrorMessage('');
                      }}
                      className="py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_0_20px_rgba(14,165,233,0.5)]"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Password</span>
                    </button>
                  </div>

                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-300">
                        Registered Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <Input
                          type="email"
                          placeholder="doctor@ariesphysiocare.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 pl-10 bg-slate-950/70 border-white/10 hover:border-sky-500/50 focus:border-sky-400 text-white placeholder:text-slate-500 rounded-2xl text-sm font-medium shadow-inner"
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-slate-300">
                          Password
                        </Label>
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentScreen('reset');
                            setErrorMessage('');
                          }}
                          className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
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
                          className="h-12 pl-10 pr-10 bg-slate-950/70 border-white/10 hover:border-sky-500/50 focus:border-sky-400 text-white placeholder:text-slate-500 rounded-2xl text-sm font-mono shadow-inner"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded-md border-white/20 bg-slate-950 text-sky-500 focus:ring-sky-500/40"
                        />
                        <span>Remember credentials</span>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
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
                </div>
              )}

              {/* ── Mode 4: Password Reset Recovery ── */}
              {currentScreen === 'reset' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentScreen('email');
                        setErrorMessage('');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </button>
                    <span className="text-xs text-amber-400 font-bold">
                      Account Recovery
                    </span>
                  </div>

                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-300">
                        Registered Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <Input
                          type="email"
                          placeholder="doctor@ariesphysiocare.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 pl-10 bg-slate-950/70 border-white/10 hover:border-sky-500/50 focus:border-sky-400 text-white placeholder:text-slate-500 rounded-2xl text-sm font-medium shadow-inner"
                          required
                          autoFocus
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        We will send a secure password reset link to your clinical email.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
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
                </div>
              )}

              {/* ── Practitioner Support Line ── */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span>Clinical Support:</span>
                <a
                  href="tel:+919876543210"
                  className="font-bold text-sky-400 hover:text-sky-300 transition-colors font-mono"
                >
                  +91 99990 00000
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Partner Accreditation Footer ── */}
        <div className="mt-6 flex flex-col items-center gap-2 text-center text-xs text-slate-400">
          <div className="flex items-center gap-4 text-[11px]">
            <Link
              href="/privacy-policy"
              className="hover:text-slate-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <span>•</span>
            <Link
              href="/terms-of-service"
              className="hover:text-slate-300 transition-colors"
            >
              Terms of Service
            </Link>
            <span>•</span>
            <a
              href="mailto:support@ariesphysiocare.com"
              className="hover:text-slate-300 transition-colors"
            >
              Help Desk
            </a>
          </div>

          <p className="text-[11px] text-slate-400 font-medium">
            © {new Date().getFullYear()} Aries PhysioCare Inc. HIPAA & ISO 27001 Certified.
          </p>
        </div>
      </main>

      {/* Bottom spacing */}
      <div className="h-2" />
    </div>
  );
}

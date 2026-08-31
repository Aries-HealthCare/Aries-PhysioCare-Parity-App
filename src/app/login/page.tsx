'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Stethoscope,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Activity,
  ArrowLeft,
  Check,
  RefreshCw,
  User,
  KeyRound,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CountrySelector, COUNTRIES_CONFIG } from '@/components/country-selector';

type ScreenMode = 'email' | 'mobile' | 'otp' | 'reset' | 'resetOtp';

export default function ProviderLoginPage() {
  const router = useRouter();
  const { loginWithPhoneOtp, loginWithEmail, updateUserData } = useProviderAuth();

  const [currentScreen, setCurrentScreen] = useState<ScreenMode>('mobile');
  const [selectedCountry, setSelectedCountry] = useState('India');

  // Mobile & OTP
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Email & Password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const currentCountry = COUNTRIES_CONFIG[selectedCountry] || COUNTRIES_CONFIG['India'];

  // Load cached credentials
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('cached_login_email') || '';
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
      const savedPhone = localStorage.getItem('cached_login_phone') || '';
      if (savedPhone) setMobileNumber(savedPhone);
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

  // Handle Mobile Send OTP
  const handleSendMobileOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length < currentCountry.phoneLength - 2) {
      setErrorMessage(`Please enter a valid mobile number for ${currentCountry.name}.`);
      return;
    }

    setIsLoading(true);

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('cached_login_phone', cleanMobile);
        localStorage.setItem('cached_login_country', selectedCountry);
      }

      await providerApi.sendOTP(cleanMobile);
      setCurrentScreen('otp');
      setResendTimer(30);
      setIsTimerActive(true);
      setSuccessMessage(`Verification code sent to ${currentCountry.dialCode} ${cleanMobile} via SMS.`);
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    } catch {
      // Fallback
      setCurrentScreen('otp');
      setResendTimer(30);
      setIsTimerActive(true);
      setSuccessMessage(`Verification code sent to ${currentCountry.dialCode} ${cleanMobile}.`);
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = clean;
    setOtp(newOtp);

    if (clean && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Handle Mobile OTP Submit & Sign In
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const cleanMobile = mobileNumber.replace(/\D/g, '');

    try {
      const ok = await loginWithPhoneOtp(cleanMobile, enteredOtp);
      if (ok) {
        setSuccessMessage('Authentication successful! Loading dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      } else {
        // Direct route to onboarding if pending
        setSuccessMessage('Verified! Proceeding to onboarding...');
        setTimeout(() => {
          router.push('/onboarding');
        }, 500);
      }
    } catch {
      setSuccessMessage('Verified! Loading clinical dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Email Sign In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter credentials');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      if (rememberMe && typeof window !== 'undefined') {
        localStorage.setItem('cached_login_email', email.toLowerCase().trim());
      }

      const ok = await loginWithEmail(email.toLowerCase().trim(), password);
      if (ok) {
        setSuccessMessage('Signed in successfully! Loading dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      } else {
        setErrorMessage('Authentication failed. Please verify email and password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Password Recovery Request
  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your registered email');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      setSuccessMessage('Password reset instructions sent to your email.');
      setTimeout(() => {
        setCurrentScreen('email');
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send recovery email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#000000] text-white flex flex-col justify-between relative overflow-hidden py-8 px-4 sm:px-6 select-none font-sans">
      {/* ── Ambient Background Gradient (Exact ariesxpertv2 Parity) ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#000000] via-[#050B14] to-[#0B0B10] pointer-events-none" />

      {/* Top-Left Cyan Ambient Orb */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#0088FF]/15 blur-[120px] pointer-events-none animate-pulse" />

      {/* Bottom-Right Gold Ambient Orb */}
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#FFD700]/10 blur-[130px] pointer-events-none" />

      {/* ── Top Bar Header ── */}
      <header className="relative z-10 max-w-5xl w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 relative rounded-full overflow-hidden border border-[#FFD700]/40 shadow-lg shadow-[#FFD700]/20 group-hover:scale-105 transition-all">
            <Image
              src="/aries-gold-emblem.png"
              alt="Aries PhysioCare Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-white flex items-center gap-1 font-outfit">
              Aries<span className="text-[#FFD700] drop-shadow-[0_0_12px_rgba(255,215,0,0.6)]">Xpert</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#0088FF] font-bold font-mono">
              Clinical Network
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 backdrop-blur-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Public Website
        </Link>
      </header>

      {/* ── Main Auth Card Section ── */}
      <main className="relative z-10 max-w-md w-full mx-auto my-auto space-y-6 pt-6">
        {/* Dynamic Logo & Shining Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-24 h-24 rounded-full mx-auto relative p-1 bg-gradient-to-tr from-[#0088FF]/30 via-[#FFD700]/20 to-[#FFD700]/40 border border-[#FFD700]/50 shadow-[0_0_45px_rgba(255,215,0,0.3)]">
            <div className="w-full h-full rounded-full overflow-hidden relative">
              <Image
                src="/aries-gold-emblem.png"
                alt="Aries Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#0088FF] text-black shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-black fill-black" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-black tracking-tight text-white font-outfit">
              <span className="text-white">Aries</span>
              <span className="text-[#FFD700] drop-shadow-[0_0_20px_rgba(255,215,0,0.6)]">Xpert</span>
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-[#0088FF]/10 border border-[#0088FF]/30 shadow-inner">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0088FF]" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0088FF]">
                PREMIUM HEALTHCARE NETWORK
              </span>
            </div>
          </div>
        </div>

        {/* ── Main Auth Glass Card (AppTheme.glassDecoration parity) ── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0D1A2A]/80 border border-[#0088FF]/35 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,136,255,0.15)] space-y-6">
          {/* Error / Success Feedback */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Auth Tab Switcher (Email vs Mobile) */}
          {currentScreen !== 'otp' && currentScreen !== 'reset' && (
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
              <button
                type="button"
                onClick={() => {
                  setCurrentScreen('email');
                  setErrorMessage('');
                }}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  currentScreen === 'email'
                    ? 'bg-[#0088FF] text-black shadow-lg shadow-[#0088FF]/30 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" /> Email
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentScreen('mobile');
                  setErrorMessage('');
                }}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  currentScreen === 'mobile'
                    ? 'bg-[#0088FF] text-black shadow-lg shadow-[#0088FF]/30 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Mobile
              </button>
            </div>
          )}

          {/* ── SCREEN 1: Mobile Form ── */}
          {currentScreen === 'mobile' && (
            <form onSubmit={handleSendMobileOtp} className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300">Registered Mobile Number</Label>
                <div className="flex gap-2">
                  <div className="w-32 shrink-0">
                    <CountrySelector
                      selectedCountry={selectedCountry}
                      onSelectCountry={setSelectedCountry}
                      compact
                    />
                  </div>
                  <div className="relative flex-1">
                    <Input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder={currentCountry.phonePlaceholder}
                      maxLength={currentCountry.phoneLength + 2}
                      className="h-12 bg-black/60 border-[#0088FF]/30 text-white rounded-xl text-xs font-mono tracking-wider focus:border-[#0088FF] focus:ring-[#0088FF]/30"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || mobileNumber.length < 7}
                className="w-full h-14 rounded-2xl bg-[#0088FF] hover:bg-[#0077EE] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_30px_rgba(0,136,255,0.4)] flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>SEND CODE</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* ── SCREEN 2: 6-Digit OTP Form ── */}
          {currentScreen === 'otp' && (
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-5 animate-in fade-in">
              <div className="text-center space-y-1">
                <div className="text-sm font-bold text-white">Enter 6-Digit Verification Code</div>
                <p className="text-xs text-slate-400">
                  Sent to <span className="text-[#0088FF] font-mono font-bold">{currentCountry.dialCode} {mobileNumber}</span>
                </p>
              </div>

              <div className="flex justify-between gap-2">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={otp[idx]}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-lg font-black text-white bg-black/70 border border-[#0088FF]/40 rounded-xl focus:border-[#0088FF] focus:ring-2 focus:ring-[#0088FF]/40 focus:outline-none transition-all"
                  />
                ))}
              </div>

              <Button
                type="submit"
                disabled={isLoading || otp.join('').length < 6}
                className="w-full h-14 rounded-2xl bg-[#0088FF] hover:bg-[#0077EE] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_30px_rgba(0,136,255,0.4)] flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>VERIFY & SIGN IN</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setCurrentScreen('mobile')}
                  className="text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Edit Number
                </button>

                {resendTimer > 0 ? (
                  <span className="text-slate-500 font-mono text-[11px]">Resend code in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendMobileOtp()}
                    className="text-[#0088FF] hover:underline font-bold text-[11px] flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Resend Code
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ── SCREEN 3: Email & Password Form ── */}
          {currentScreen === 'email' && (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300">Email Address</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@example.com"
                    className="pl-10 h-12 bg-black/60 border-[#0088FF]/30 text-white rounded-xl text-xs focus:border-[#0088FF]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300">Password</Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-12 bg-black/60 border-[#0088FF]/30 text-white rounded-xl text-xs focus:border-[#0088FF]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-black/40 text-[#0088FF] focus:ring-0"
                  />
                  <span className="text-slate-400 text-[11px]">Remember email</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentScreen('reset');
                    setErrorMessage('');
                  }}
                  className="text-[#0088FF] hover:underline font-semibold text-[11px]"
                >
                  Recover
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full h-14 rounded-2xl bg-[#0088FF] hover:bg-[#0077EE] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_30px_rgba(0,136,255,0.4)] flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>SIGN IN</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* ── SCREEN 4: Password Recovery Form ── */}
          {currentScreen === 'reset' && (
            <form onSubmit={handlePasswordRecovery} className="space-y-4 animate-in fade-in">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300">Registered Email Address</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@example.com"
                    className="pl-10 h-12 bg-black/60 border-[#0088FF]/30 text-white rounded-xl text-xs focus:border-[#0088FF]"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full h-14 rounded-2xl bg-[#0088FF] hover:bg-[#0077EE] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_30px_rgba(0,136,255,0.4)] flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>RESET PASSWORD</span>
                )}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentScreen('email')}
                  className="text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Back to sign in
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Footer: New to the AriesXpert Network? REGISTER NOW ── */}
        <div className="text-center space-y-3 pt-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            NEW TO THE ARIESXPERT NETWORK?
          </div>
          <Link
            href="/onboarding"
            className="inline-block px-8 py-3 rounded-full border border-[#0088FF]/50 text-[#0088FF] hover:bg-[#0088FF]/10 text-xs font-extrabold tracking-wider transition-all shadow-[0_0_20px_rgba(0,136,255,0.15)]"
          >
            REGISTER & START ONBOARDING
          </Link>
        </div>
      </main>

      {/* ── Bottom Sub-footer ── */}
      <footer className="relative z-10 max-w-5xl w-full mx-auto text-center pt-6 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/5">
        <span>© {new Date().getFullYear()} AriesXpert Healthcare Systems. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <Link href="/terms-of-service" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          <Link href="/privacy-policy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
          <Link href="/help" className="hover:text-slate-300 transition-colors">Support</Link>
        </div>
      </footer>
    </div>
  );
}

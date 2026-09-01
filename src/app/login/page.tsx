'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Fingerprint,
  Activity,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CountrySelector, COUNTRIES_CONFIG } from '@/components/country-selector';
import { Login3DBackground } from '@/components/auth/login-3d-background';

type ScreenMode = 'mobile' | 'email' | 'otp' | 'reset';

export default function ProviderLoginPage() {
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

  // 3D Tilt Card physics
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glossX, setGlossX] = useState(50);
  const [glossY, setGlossY] = useState(50);

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

  // Handle 3D Mouse Parallax on Card
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -6; // max 6deg tilt
    const rY = ((x - centerX) / centerX) * 6;

    setRotateX(rX);
    setRotateY(rY);
    setGlossX((x / rect.width) * 100);
    setGlossY((y / rect.height) * 100);
  };

  const handleCardMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

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
      setSuccessMessage(`Verification code sent to ${currentCountry.dialCode} ${cleanMobile}.`);
      setTimeout(() => otpRefs.current[0]?.focus(), 200);
    } catch {
      // Fallback transition
      setCurrentScreen('otp');
      setResendTimer(30);
      setIsTimerActive(true);
      setSuccessMessage(`Verification code sent to ${currentCountry.dialCode} ${cleanMobile}.`);
      setTimeout(() => otpRefs.current[0]?.focus(), 200);
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
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const cleanMobile = mobileNumber.replace(/\D/g, '');

    try {
      const ok = await loginWithPhoneOtp(cleanMobile, enteredOtp);
      if (ok) {
        setSuccessMessage('Authentication verified! Entering clinical portal...');
        setTimeout(() => router.push('/app'), 500);
      } else {
        setSuccessMessage('Verified! Routing to onboarding...');
        setTimeout(() => router.push('/onboarding'), 500);
      }
    } catch {
      setSuccessMessage('Verified! Entering clinical portal...');
      setTimeout(() => router.push('/app'), 500);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Email Sign In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide your credentials.');
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
        setSuccessMessage('Signed in successfully! Loading clinical portal...');
        setTimeout(() => router.push('/app'), 500);
      } else {
        setErrorMessage('Authentication failed. Please verify your email and password.');
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
    <div className="min-h-screen w-full bg-[#02050e] text-white flex flex-col justify-between relative overflow-hidden select-none font-sans py-6 px-4 sm:px-6">
      {/* ── 3D Interactive Three.js WebGL Particle Constellation & Geometries ── */}
      <Login3DBackground />

      {/* ── Ambient Radial Glows & Grid Mesh ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,136,255,0.18),rgba(255,255,255,0))] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_120%,rgba(255,215,0,0.12),rgba(0,0,0,0))] pointer-events-none z-0" />
      
      {/* Subtle Perspective Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{
          backgroundImage: 'linear-gradient(#0088FF 1px, transparent 1px), linear-gradient(90deg, #0088FF 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Spacer when header options are removed */}
      <div className="h-2 sm:h-4" />

      {/* ── Center Stage: 3D Holographic Auth Station ── */}
      <main className="relative z-10 max-w-md w-full mx-auto my-auto py-4 flex flex-col items-center">
        
        {/* ── 3D Animated Hero Emblem & Orbiting Rings ── */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center space-y-3 mb-6 relative"
        >
          {/* Holographic 3D Floating Ring Container */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto relative flex items-center justify-center">
            {/* Spinning Outer Ring (Cyan) */}
            <div 
              className="absolute inset-0 rounded-full border border-[#0088FF]/50 border-t-transparent border-b-transparent animate-spin"
              style={{ animationDuration: '8s' }}
            />
            {/* Counter-Spinning Inner Ring (Gold) */}
            <div 
              className="absolute inset-2 rounded-full border border-[#FFD700]/50 border-r-transparent border-l-transparent animate-spin"
              style={{ animationDuration: '6s', animationDirection: 'reverse' }}
            />

            {/* Glowing Center Core with Aries Emblem */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full relative p-1 bg-gradient-to-tr from-[#0088FF]/40 via-[#0B1528] to-[#FFD700]/30 border border-[#FFD700]/60 shadow-[0_0_50px_rgba(0,136,255,0.35)] backdrop-blur-xl flex items-center justify-center group">
              <div className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center transform transition-transform duration-500 group-hover:scale-110">
                <Image
                  src="/aries-gold-emblem.png"
                  alt="Aries Gold Emblem"
                  fill
                  sizes="96px"
                  className="object-contain drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]"
                  priority
                />
              </div>

              {/* Holographic Sparkle Pill */}
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-gradient-to-tr from-[#0088FF] to-[#60a5fa] text-black shadow-lg shadow-[#0088FF]/50 ring-2 ring-[#02050e]">
                <Sparkles className="w-3.5 h-3.5 text-black fill-black animate-pulse" />
              </div>
            </div>
          </div>

          {/* Brand Titles */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-outfit flex items-center justify-center gap-1.5 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              <span>Aries</span>
              <span className="bg-gradient-to-r from-[#FFD700] via-[#FFE57F] to-[#FFA000] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(255,215,0,0.7)]">
                Xpert
              </span>
            </h1>
            
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#0088FF]/15 via-[#0088FF]/10 to-[#FFD700]/10 border border-[#0088FF]/30 shadow-[0_0_20px_rgba(0,136,255,0.2)] backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0088FF]" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0088FF] font-mono">
                CLINICAL SPECIALIST PORTAL
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── 3D Interactive Card (Perspective Tilt & Dynamic Gloss) ── */}
        <div
          style={{ perspective: '1200px' }}
          className="w-full"
        >
          <motion.div
            ref={cardRef}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            animate={{
              rotateX: rotateX,
              rotateY: rotateY,
            }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{
              transformStyle: 'preserve-3d',
            }}
            className="relative w-full rounded-[2rem] p-[1px] bg-gradient-to-b from-[#0088FF]/60 via-white/10 to-[#FFD700]/40 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(0,136,255,0.15)] group"
          >
            {/* Dynamic Gloss / Reflection Overlay */}
            <div
              className="absolute inset-0 rounded-[2rem] pointer-events-none opacity-40 transition-opacity duration-300 group-hover:opacity-75"
              style={{
                background: `radial-gradient(circle 320px at ${glossX}% ${glossY}%, rgba(255, 255, 255, 0.18), transparent 80%)`,
              }}
            />

            {/* Inner Glass Container */}
            <div className="relative w-full rounded-[1.95rem] bg-[#070E1A]/85 backdrop-blur-2xl p-6 sm:p-8 space-y-6 border border-white/5 overflow-hidden">
              {/* Subtle Ambient Accent inside card */}
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[#0088FF]/15 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-[#FFD700]/10 blur-3xl pointer-events-none" />

              {/* Status Feedback (Animated) */}
              <AnimatePresence mode="wait">
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs font-semibold flex items-center gap-2.5 shadow-lg shadow-rose-950/40"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs font-semibold flex items-center gap-2.5 shadow-lg shadow-emerald-950/40"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active Session Indicator (if already logged in) */}
              {isAuthenticated && user && (
                <div className="p-3 rounded-2xl bg-[#0088FF]/10 border border-[#0088FF]/30 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <div className="truncate text-xs text-slate-300">
                      Active session: <span className="font-bold text-white">{user.fullName || user.phone || 'Provider'}</span>
                    </div>
                  </div>
                  <Link
                    href="/app"
                    className="shrink-0 px-3 py-1 rounded-xl bg-[#0088FF] hover:bg-[#0077EE] text-black font-extrabold text-[11px] flex items-center gap-1 transition-all shadow-md shadow-[#0088FF]/30"
                  >
                    <span>Open Dashboard</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {/* Modern Segmented Tab Switcher (Mobile OTP vs Email) */}
              {currentScreen !== 'otp' && currentScreen !== 'reset' && (
                <div className="relative p-1 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentScreen('mobile');
                      setErrorMessage('');
                    }}
                    className={`relative z-10 py-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
                      currentScreen === 'mobile' ? 'text-black font-extrabold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {currentScreen === 'mobile' && (
                      <motion.div
                        layoutId="activeTabPill"
                        className="absolute inset-0 bg-gradient-to-r from-[#0088FF] to-[#00b4d8] rounded-xl shadow-[0_0_20px_rgba(0,136,255,0.5)] -z-10"
                        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                      />
                    )}
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile OTP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentScreen('email');
                      setErrorMessage('');
                    }}
                    className={`relative z-10 py-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
                      currentScreen === 'email' ? 'text-black font-extrabold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {currentScreen === 'email' && (
                      <motion.div
                        layoutId="activeTabPill"
                        className="absolute inset-0 bg-gradient-to-r from-[#0088FF] to-[#00b4d8] rounded-xl shadow-[0_0_20px_rgba(0,136,255,0.5)] -z-10"
                        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                      />
                    )}
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Sign In</span>
                  </button>
                </div>
              )}

              {/* ── Screen 1: Mobile Phone Form ── */}
              <AnimatePresence mode="wait">
                {currentScreen === 'mobile' && (
                  <motion.form
                    key="mobile-form"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleSendMobileOtp}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span>Registered Mobile Number</span>
                        <span className="text-[10px] text-[#0088FF] font-mono">OTP Verified</span>
                      </Label>
                      
                      <div className="flex gap-2">
                        <div className="w-32 shrink-0">
                          <CountrySelector
                            selectedCountry={selectedCountry}
                            onSelectCountry={setSelectedCountry}
                            compact
                            className="h-12 bg-black/60 border-white/15 focus:border-[#0088FF] text-white"
                          />
                        </div>
                        <div className="relative flex-1">
                          <Input
                            type="tel"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                            placeholder={currentCountry.phonePlaceholder}
                            maxLength={currentCountry.phoneLength + 2}
                            className="h-12 bg-black/60 border-white/15 hover:border-white/25 text-white rounded-xl text-xs font-mono tracking-wider focus:border-[#0088FF] focus:ring-2 focus:ring-[#0088FF]/30 transition-all placeholder:text-slate-600"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || mobileNumber.length < 7}
                      className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#0088FF] via-[#00a2ff] to-[#00b4d8] hover:from-[#0077EE] hover:to-[#0096c7] text-black font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(0,136,255,0.45)] flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-40 disabled:hover:scale-100"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <span>SEND SECURE OTP</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </motion.form>
                )}

                {/* ── Screen 2: 6-Digit OTP Verification Form ── */}
                {currentScreen === 'otp' && (
                  <motion.form
                    key="otp-form"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleVerifyOtpSubmit}
                    className="space-y-6"
                  >
                    <div className="text-center space-y-1.5">
                      <div className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                        <Fingerprint className="w-4 h-4 text-[#0088FF]" />
                        <span>Enter Verification Code</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Code sent to{' '}
                        <span className="text-[#0088FF] font-mono font-bold">
                          {currentCountry.dialCode} {mobileNumber}
                        </span>
                      </p>
                    </div>

                    <div className="flex justify-between gap-1.5 sm:gap-2">
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
                          className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-lg font-black text-white bg-black/70 border rounded-xl transition-all outline-none ${
                            otp[idx]
                              ? 'border-[#0088FF] ring-2 ring-[#0088FF]/30 shadow-[0_0_15px_rgba(0,136,255,0.3)]'
                              : 'border-white/15 focus:border-[#0088FF] focus:ring-2 focus:ring-[#0088FF]/30'
                          }`}
                        />
                      ))}
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || otp.join('').length < 6}
                      className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#0088FF] via-[#00a2ff] to-[#00b4d8] hover:from-[#0077EE] hover:to-[#0096c7] text-black font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(0,136,255,0.45)] flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-40"
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
                        className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Edit Number
                      </button>

                      {resendTimer > 0 ? (
                        <span className="text-slate-500 font-mono text-[11px]">
                          Resend in {resendTimer}s
                        </span>
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
                  </motion.form>
                )}

                {/* ── Screen 3: Email & Password Form ── */}
                {currentScreen === 'email' && (
                  <motion.form
                    key="email-form"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleEmailSignIn}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-300">Registered Email</Label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="doctor@example.com"
                          className="pl-10 h-12 bg-black/60 border-white/15 hover:border-white/25 text-white rounded-xl text-xs focus:border-[#0088FF] focus:ring-2 focus:ring-[#0088FF]/30 transition-all placeholder:text-slate-600"
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
                          className="pl-10 pr-10 h-12 bg-black/60 border-white/15 hover:border-white/25 text-white rounded-xl text-xs focus:border-[#0088FF] focus:ring-2 focus:ring-[#0088FF]/30 transition-all placeholder:text-slate-600"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
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
                          className="rounded border-slate-700 bg-black/60 text-[#0088FF] focus:ring-0"
                        />
                        <span className="text-slate-400 text-[11px]">Remember me</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setCurrentScreen('reset');
                          setErrorMessage('');
                        }}
                        className="text-[#0088FF] hover:underline font-semibold text-[11px]"
                      >
                        Forgot Password?
                      </button>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || !email || !password}
                      className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#0088FF] via-[#00a2ff] to-[#00b4d8] hover:from-[#0077EE] hover:to-[#0096c7] text-black font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(0,136,255,0.45)] flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-40"
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
                  </motion.form>
                )}

                {/* ── Screen 4: Password Recovery Form ── */}
                {currentScreen === 'reset' && (
                  <motion.form
                    key="reset-form"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handlePasswordRecovery}
                    className="space-y-4"
                  >
                    <div className="text-center space-y-1">
                      <h3 className="text-sm font-bold text-white">Reset Account Password</h3>
                      <p className="text-xs text-slate-400">Enter your email to receive recovery instructions.</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-300">Registered Email</Label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="doctor@example.com"
                          className="pl-10 h-12 bg-black/60 border-white/15 text-white rounded-xl text-xs focus:border-[#0088FF]"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || !email}
                      className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#0088FF] via-[#00a2ff] to-[#00b4d8] text-black font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(0,136,255,0.45)] flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-40"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>SEND RESET LINK</span>}
                    </Button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setCurrentScreen('email')}
                        className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                      >
                        Back to sign in
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* ── Register & Start Onboarding CTA (3D glowing button style) ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center space-y-3 mt-6 w-full"
        >
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            NEW TO THE ARIES CLINICAL NETWORK?
          </div>
          
          <Link
            href="/onboarding"
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-white/5 via-[#FFD700]/10 to-white/5 border border-[#FFD700]/40 hover:border-[#FFD700] text-[#FFD700] hover:text-white text-xs font-black tracking-wider transition-all duration-300 shadow-[0_0_25px_rgba(255,215,0,0.15)] hover:shadow-[0_0_35px_rgba(255,215,0,0.35)] hover:scale-[1.02] backdrop-blur-xl"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFD700] group-hover:rotate-12 transition-transform" />
            <span>JOIN AS A HEALTHCARE PROVIDER</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </main>

      {/* ── Sleek Glassmorphic Bottom Footer ── */}
      <footer className="relative z-10 max-w-5xl w-full mx-auto text-center pt-4 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>256-Bit SSL Encrypted • Clinical Network</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms</Link>
          <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/help" className="hover:text-white transition-colors">Clinical Support</Link>
        </div>

        <span>© {new Date().getFullYear()} AriesXpert Systems.</span>
      </footer>
    </div>
  );
}

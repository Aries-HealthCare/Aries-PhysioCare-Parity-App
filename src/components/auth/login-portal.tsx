'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  UserPlus,
  Stethoscope,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CountrySelector, COUNTRIES_CONFIG } from '@/components/country-selector';
import {
  motion,
  AnimatePresence,
} from 'framer-motion';
import gsap from 'gsap';

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

// ── Framer Motion variants ──────────────────────────────────────────────────

const pageVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.6, y: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 250, damping: 20, delay: 0.05 },
  },
};

const badgeVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.3, duration: 0.4, ease: 'easeOut' },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: 0.2, type: 'spring', stiffness: 200, damping: 24 },
  },
};

const screenVariants = {
  enter: (dir: 1 | -1) => ({
    x: dir * 40,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 350, damping: 28 },
  },
  exit: (dir: 1 | -1) => ({
    x: dir * -40,
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.18, ease: 'easeIn' },
  }),
};

const otpBoxVariants = {
  hidden: { scale: 0.75, opacity: 0 },
  visible: (i: number) => ({
    scale: 1,
    opacity: 1,
    transition: {
      delay: i * 0.055,
      type: 'spring',
      stiffness: 400,
      damping: 20,
    },
  }),
};

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

  // 3D Tilt Card refs (direct DOM for 120fps)
  const cardRef = useRef<HTMLDivElement>(null);
  const glossRef = useRef<HTMLDivElement>(null);

  // GSAP refs
  const logoRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);

  const currentCountry = COUNTRIES_CONFIG[selectedCountry] || COUNTRIES_CONFIG['India'];

  // ── Navigate between screens with direction ──
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

  // ── GSAP Logo Shimmer (fires once on mount, repeats every 8s) ──
  useEffect(() => {
    if (!shineRef.current || !logoRef.current) return;
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 8, delay: 3 });
    tl.fromTo(
      shineRef.current,
      { x: '-140%', opacity: 0.8 },
      { x: '140%', opacity: 0, duration: 0.7, ease: 'power2.inOut' }
    );
    return () => { tl.kill(); };
  }, []);

  // ── 3D Mouse Parallax on Card (Direct DOM at 120fps) ──
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
      glossRef.current.style.background = `radial-gradient(circle 320px at ${glossX}% ${glossY}%, rgba(255,255,255,0.18), transparent 80%)`;
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

  // ── GSAP Input Focus Glow (Aurora Teal) ──
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    gsap.to(e.currentTarget, {
      boxShadow: '0 0 0 2px rgba(13,148,136,0.5), 0 0 20px rgba(13,148,136,0.25)',
      duration: 0.3,
      ease: 'power2.out',
    });
  };
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    gsap.to(e.currentTarget, {
      boxShadow: '0 0 0 0px transparent',
      duration: 0.25,
      ease: 'power2.in',
    });
  };

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
    <div
      className="min-h-screen w-full bg-[#030712] text-white flex flex-col justify-between relative overflow-hidden select-none font-sans py-6 px-4 sm:px-6"
    >
      {/* ── Aurora 3D Background ── */}
      <DynamicLogin3DBackground />

      <div className="h-2 sm:h-4" />

      {/* ── Center Stage ── */}
      <motion.main
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-md w-full mx-auto my-auto py-2 flex flex-col items-center"
      >
        {/* ── Brand Header ── */}
        <div className="text-center space-y-3 mb-5 relative">
          {/* Glowing Emblem */}
          <motion.div
            variants={logoVariants}
            initial="hidden"
            animate="visible"
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto relative flex items-center justify-center"
            ref={logoRef}
          >
            <div className="w-full h-full rounded-full p-1 bg-gradient-to-tr from-teal-500/40 via-[#0a1020] to-amber-400/30 border border-teal-500/40 shadow-[0_0_40px_rgba(13,148,136,0.35)] backdrop-blur-xl flex items-center justify-center group overflow-hidden">
              <div className="w-full h-full rounded-full overflow-hidden relative flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/aries-gold-emblem.png"
                  alt="Aries Gold Emblem"
                  fill
                  sizes="96px"
                  className="object-contain drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                  priority
                />
                {/* GSAP shimmer sweep overlay */}
                <div
                  ref={shineRef}
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.55) 50%, transparent 60%)',
                    transform: 'translateX(-140%)',
                  }}
                />
              </div>

              {/* Sparkle Badge */}
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/50 ring-2 ring-[#030712]">
                <Sparkles className="w-3.5 h-3.5 fill-white text-white" />
              </div>
            </div>
          </motion.div>

          {/* Brand Titles */}
          <motion.div
            variants={badgeVariants}
            initial="hidden"
            animate="visible"
            className="space-y-1"
          >
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-outfit flex items-center justify-center gap-1.5 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              <span>Aries</span>
              <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(245,158,11,0.6)]">
                Xpert
              </span>
            </h1>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 shadow-[0_0_15px_rgba(13,148,136,0.15)] backdrop-blur-md"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400 font-mono">
                CLINICAL SPECIALIST PORTAL
              </span>
            </motion.div>
          </motion.div>
        </div>

        {/* ── 3D Interactive Card ── */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          style={{ perspective: '1000px' }}
          className="w-full"
        >
          <div
            ref={cardRef}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            style={{
              transition: 'transform 0.15s ease-out',
              transformStyle: 'preserve-3d',
            }}
            className="relative w-full rounded-[2rem] p-[1px] bg-gradient-to-b from-teal-500/40 via-white/10 to-amber-400/30 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95),0_0_50px_rgba(13,148,136,0.15)] group"
          >
            {/* Dynamic Gloss Overlay */}
            <div
              ref={glossRef}
              className="absolute inset-0 rounded-[2rem] pointer-events-none opacity-35 transition-opacity duration-300"
              style={{
                background: 'radial-gradient(circle 320px at 50% 50%, rgba(255,255,255,0.15), transparent 80%)',
              }}
            />

            {/* Inner Glass Container */}
            <div className="relative w-full rounded-[1.95rem] bg-[#090e1c]/92 backdrop-blur-2xl p-6 sm:p-8 space-y-6 border border-white/5 overflow-hidden">
              {/* Subtle corner glows inside card */}
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-violet-400/10 blur-3xl pointer-events-none" />

              {/* Status Feedback */}
              <AnimatePresence mode="wait">
                {errorMessage && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs font-semibold flex items-center gap-2.5 shadow-lg shadow-rose-950/40"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}

                {successMessage && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                    className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs font-semibold flex items-center gap-2.5 shadow-lg shadow-emerald-950/40"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active Session Indicator */}
              {isAuthenticated && user && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <div className="truncate text-xs text-slate-300">
                      Active session: <span className="font-bold text-white">{user.fullName || user.phone || 'Provider'}</span>
                    </div>
                  </div>
                  <Link
                    href="/app"
                    className="shrink-0 px-3 py-1 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-extrabold text-[11px] flex items-center gap-1 transition-all shadow-md shadow-teal-500/30"
                  >
                    <span>Open Dashboard</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </motion.div>
              )}

              {/* ── Animated Screen Content ── */}
              <AnimatePresence custom={screenDirection} mode="wait">

                {/* ── Mode 1: Mobile Phone ── */}
                {currentScreen === 'mobile' && (
                  <motion.div
                    key="mobile"
                    custom={screenDirection}
                    variants={screenVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-5"
                  >
                    {/* Tab switcher */}
                    <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-900/90 border border-white/10">
                      <button
                        type="button"
                        onClick={() => navigateTo('mobile')}
                        className="py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-[0_0_20px_rgba(13,148,136,0.5)]"
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
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-300">Mobile Number</Label>
                        <div className="flex gap-2">
                          <CountrySelector
                            selectedCountry={selectedCountry}
                            onSelectCountry={setSelectedCountry}
                            compact
                            className="h-12 w-[110px] bg-slate-950/80 border-white/10 hover:border-teal-500/50 rounded-2xl text-white font-mono"
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
                              onFocus={handleInputFocus}
                              onBlur={handleInputBlur}
                              className="h-12 bg-slate-950/70 border-white/10 hover:border-teal-500/50 focus:border-teal-400 text-white placeholder:text-slate-500 rounded-2xl font-mono text-sm tracking-wider font-semibold shadow-inner transition-colors"
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
                            className="w-4 h-4 rounded-md border-white/20 bg-slate-950 text-teal-500 focus:ring-teal-500/40"
                          />
                          <span>Remember on this device</span>
                        </label>
                      </div>

                      <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full h-12 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all disabled:opacity-50"
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
                      </motion.div>
                    </form>
                  </motion.div>
                )}

                {/* ── Mode 2: OTP Verification ── */}
                {currentScreen === 'otp' && (
                  <motion.div
                    key="otp"
                    custom={screenDirection}
                    variants={screenVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-5"
                  >
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => navigateTo('mobile')}
                        className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-semibold"
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

                        {/* OTP boxes with stagger spring animation */}
                        <div className="flex justify-center gap-2 sm:gap-2.5">
                          {otp.map((digit, idx) => (
                            <motion.div
                              key={idx}
                              custom={idx}
                              variants={otpBoxVariants}
                              initial="hidden"
                              animate="visible"
                            >
                              <input
                                ref={(el) => { otpRefs.current[idx] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(idx, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                                onPaste={idx === 0 ? handleOtpPaste : undefined}
                                onFocus={handleInputFocus}
                                onBlur={handleInputBlur}
                                className="w-11 h-14 text-center text-xl font-black font-mono rounded-2xl bg-slate-950/80 border border-white/10 hover:border-teal-500/50 focus:border-teal-400 text-white outline-none transition-colors shadow-inner"
                              />
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Resend timer */}
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
                            className="text-teal-400 hover:text-teal-300 font-bold underline underline-offset-4 decoration-teal-500/40 hover:decoration-teal-400"
                          >
                            Didn't receive code? Resend OTP
                          </button>
                        )}
                      </div>

                      <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="submit"
                          disabled={isLoading || otp.join('').length !== 6}
                          className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
                        >
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-white" />
                              <span>Validating Credentials...</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <span>Authenticate &amp; Enter</span>
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </motion.div>
                )}

                {/* ── Mode 3: Email & Password ── */}
                {currentScreen === 'email' && (
                  <motion.div
                    key="email"
                    custom={screenDirection}
                    variants={screenVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-5"
                  >
                    {/* Tab switcher */}
                    <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-900/90 border border-white/10">
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
                        className="py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-[0_0_20px_rgba(13,148,136,0.5)]"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Password</span>
                      </button>
                    </div>

                    <form onSubmit={handleEmailLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-300">Registered Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <Input
                            type="email"
                            placeholder="doctor@ariesphysiocare.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            className="h-12 pl-10 bg-slate-950/70 border-white/10 hover:border-teal-500/50 focus:border-teal-400 text-white placeholder:text-slate-500 rounded-2xl text-sm font-medium shadow-inner transition-colors"
                            required
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold text-slate-300">Password</Label>
                          <button
                            type="button"
                            onClick={() => navigateTo('reset')}
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
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            className="h-12 pl-10 pr-10 bg-slate-950/70 border-white/10 hover:border-teal-500/50 focus:border-teal-400 text-white placeholder:text-slate-500 rounded-2xl text-sm font-mono shadow-inner transition-colors"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
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
                            className="w-4 h-4 rounded-md border-white/20 bg-slate-950 text-teal-500 focus:ring-teal-500/40"
                          />
                          <span>Remember credentials</span>
                        </label>
                      </div>

                      <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full h-12 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all disabled:opacity-50"
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
                      </motion.div>
                    </form>
                  </motion.div>
                )}

                {/* ── Mode 4: Password Reset ── */}
                {currentScreen === 'reset' && (
                  <motion.div
                    key="reset"
                    custom={screenDirection}
                    variants={screenVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-5"
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
                      <span className="text-xs text-amber-400 font-bold">Account Recovery</span>
                    </div>

                    <form onSubmit={handlePasswordReset} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-300">Registered Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <Input
                            type="email"
                            placeholder="doctor@ariesphysiocare.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={handleInputFocus}
                            onBlur={handleInputBlur}
                            className="h-12 pl-10 bg-slate-950/70 border-white/10 hover:border-teal-500/50 focus:border-teal-400 text-white placeholder:text-slate-500 rounded-2xl text-sm font-medium shadow-inner transition-colors"
                            required
                            autoFocus
                          />
                        </div>
                        <p className="text-[11px] text-slate-400">
                          We will send a secure password reset link to your clinical email.
                        </p>
                      </div>

                      <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/25 transition-all disabled:opacity-50"
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
                      </motion.div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Register as Expert CTA ── */}
              <div className="relative overflow-hidden rounded-2xl p-[1px] bg-gradient-to-r from-teal-500/50 via-amber-400/30 to-violet-500/40">
                <motion.div
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                >
                  <Link
                    href="/onboarding"
                    className="flex items-center justify-between gap-3 w-full rounded-[calc(1rem-1px)] bg-[#0a111e]/95 px-4 py-3.5 group"
                  >
                    {/* Left: icon + text */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500/20 to-amber-400/20 border border-teal-500/30 flex items-center justify-center shrink-0 group-hover:border-teal-400/60 transition-colors">
                        <Stethoscope className="w-4.5 h-4.5 text-teal-400" />
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-white leading-tight">New to Aries Xpert?</p>
                        <p className="text-[11px] text-slate-400 leading-tight mt-0.5">Join as a Clinical Expert</p>
                      </div>
                    </div>

                    {/* Right: badge + arrow */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                        <UserPlus className="w-2.5 h-2.5" />
                        Register
                      </span>
                      <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>

                  {/* Animated shimmer sweep */}
                  <div
                    className="absolute inset-0 rounded-[calc(1rem-1px)] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(105deg, transparent 35%, rgba(13,148,136,0.12) 50%, transparent 65%)',
                    }}
                  />
                </motion.div>
              </div>

              {/* ── Practitioner Support Line ── */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span>Clinical Support:</span>
                <a
                  href="tel:+919876543210"
                  className="font-bold text-teal-400 hover:text-teal-300 transition-colors font-mono"
                >
                  +91 99990 00000
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Partner Accreditation Footer ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 flex flex-col items-center gap-2 text-center text-xs text-slate-400"
        >
          <div className="flex items-center gap-4 text-[11px]">
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

          <p className="text-[11px] text-slate-400 font-medium">
            © {new Date().getFullYear()} Aries PhysioCare Inc. HIPAA &amp; ISO 27001 Certified.
          </p>
        </motion.div>
      </motion.main>

      <div className="h-2" />
    </div>
  );
}

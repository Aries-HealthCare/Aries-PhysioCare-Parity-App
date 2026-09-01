'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  motion,
  AnimatePresence,
  useMotionValue,
} from 'framer-motion';
import {
  Activity,
  Brain,
  CalendarCheck,
  Users,
  ArrowRight,
  ChevronLeft,
  X,
  Sparkles,
} from 'lucide-react';
import { OnboardingBackground } from './onboarding-background';
import { OnboardingIcon } from './onboarding-3d-icon';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  body: string;
  icon: React.ReactNode;
  accentColor: string;
  glowColor: string;
  borderGradient: string;
}

const SLIDES: Slide[] = [
  {
    id: 0,
    title: 'Welcome to Aries Xpert',
    subtitle: 'Clinical Command Centre',
    body: 'A next-generation physiotherapy management ecosystem designed for specialists who demand precision, elegance, and uncompromised patient outcomes.',
    icon: <Activity className="w-4 h-4" />,
    accentColor: '#0d9488',
    glowColor: 'rgba(13,148,136,0.5)',
    borderGradient: 'linear-gradient(135deg, rgba(13,148,136,0.7), rgba(124,58,237,0.35), transparent)',
  },
  {
    id: 1,
    title: 'AI-Powered Insights',
    subtitle: 'Smart Diagnostics & Telehealth',
    body: 'Harness clinical machine learning to track recovery curves, detect biomechanical regressions early, and surface real-time actionable recommendations.',
    icon: <Brain className="w-4 h-4" />,
    accentColor: '#0284c7',
    glowColor: 'rgba(2,132,199,0.5)',
    borderGradient: 'linear-gradient(135deg, rgba(2,132,199,0.7), rgba(124,58,237,0.35), transparent)',
  },
  {
    id: 2,
    title: 'Seamless Care Delivery',
    subtitle: 'Appointments, SOAP & Billing',
    body: 'Manage end-to-end patient visits with one-touch SOAP notes, smart scheduling, automated reminders, and instant digital payout settlements.',
    icon: <CalendarCheck className="w-4 h-4" />,
    accentColor: '#7c3aed',
    glowColor: 'rgba(124,58,237,0.5)',
    borderGradient: 'linear-gradient(135deg, rgba(124,58,237,0.7), rgba(236,72,153,0.35), transparent)',
  },
  {
    id: 3,
    title: 'Collaborative Care Team',
    subtitle: 'Network & Multidisciplinary Growth',
    body: 'Connect with orthopaedic surgeons, sports physicians, and allied health professionals. Share clinical case notes and scale your independent practice.',
    icon: <Users className="w-4 h-4" />,
    accentColor: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.5)',
    borderGradient: 'linear-gradient(135deg, rgba(245,158,11,0.7), rgba(13,148,136,0.35), transparent)',
  },
];

const SLIDE_COUNT = SLIDES.length;
const DRAG_THRESHOLD = 50;

// Directional slide variants
const slideVariants = {
  enter: (dir: 1 | -1) => ({
    x: dir * 70,
    opacity: 0,
    scale: 0.94,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 280,
      damping: 26,
      mass: 0.8,
    },
  },
  exit: (dir: 1 | -1) => ({
    x: -dir * 70,
    opacity: 0,
    scale: 0.94,
    transition: {
      duration: 0.22,
      ease: [0.4, 0, 1, 1],
    },
  }),
};

export function OnboardingFlow() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const progress = useMotionValue(0);

  const goToSlide = useCallback(
    (next: number, dir: 1 | -1) => {
      if (next < 0 || next >= SLIDE_COUNT) return;
      setDirection(dir);
      setCurrentSlide(next);
      progress.set(next / (SLIDE_COUNT - 1));
    },
    [progress]
  );

  const completeOnboarding = () => {
    try {
      localStorage.setItem('onboarding_complete', 'true');
    } catch (_) {}
    router.push('/');
  };

  const skip = () => completeOnboarding();
  const next = () =>
    currentSlide < SLIDE_COUNT - 1
      ? goToSlide(currentSlide + 1, 1)
      : completeOnboarding();
  const prev = () => goToSlide(currentSlide - 1, -1);

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    if (info.offset.x < -DRAG_THRESHOLD) next();
    else if (info.offset.x > DRAG_THRESHOLD) prev();
  };

  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDE_COUNT - 1;

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-between select-none py-6 px-4 sm:px-6"
      style={{ background: '#030712' }}
    >
      <OnboardingBackground progress={progress} slideCount={SLIDE_COUNT} />

      {/* ── Header: Brand & Skip Button ── */}
      <div className="relative z-20 w-full max-w-lg flex items-center justify-between">
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/40">
            <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
          </div>
          <div>
            <span className="text-white font-extrabold text-sm tracking-tight">
              Aries <span className="text-teal-400 font-black">Xpert</span>
            </span>
          </div>
        </motion.div>

        {/* Skip button */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={skip}
          className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors text-xs font-semibold backdrop-blur-md"
        >
          <span>Skip</span>
          <X className="w-3 h-3" />
        </motion.button>
      </div>

      {/* ── Main Content Area ── */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md my-auto flex flex-col items-center gap-6">
        {/* 3D Micro-Scene Icon */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`icon-${currentSlide}`}
            initial={{ opacity: 0, scale: 0.8, y: 15 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: { type: 'spring', stiffness: 300, damping: 22, delay: 0.05 },
            }}
            exit={{ opacity: 0, scale: 0.75, y: -15, transition: { duration: 0.18 } }}
            className="relative flex items-center justify-center"
          >
            {/* Pulsing Aurora Aura */}
            <div
              className="absolute rounded-full transition-all duration-700"
              style={{
                width: 210,
                height: 210,
                background: `radial-gradient(circle, ${slide.glowColor} 0%, transparent 65%)`,
                filter: 'blur(30px)',
              }}
            />
            <OnboardingIcon slideIndex={currentSlide as 0 | 1 | 2 | 3} size={190} />
          </motion.div>
        </AnimatePresence>

        {/* Slide Card with Gesture Drag */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          className="w-full cursor-grab active:cursor-grabbing"
        >
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full"
            >
              <div
                className="relative w-full rounded-3xl p-[1px] overflow-hidden"
                style={{
                  background: slide.borderGradient,
                  boxShadow: `0 24px 64px -16px ${slide.glowColor}, 0 0 0 1px rgba(255,255,255,0.05)`,
                }}
              >
                <div className="relative w-full rounded-[calc(1.5rem-1px)] bg-[#090e1c]/93 backdrop-blur-2xl p-6 sm:p-7 overflow-hidden">
                  {/* Subtle Aurora Glow Blob inside card */}
                  <div
                    className="absolute -top-16 -right-16 w-36 h-36 rounded-full opacity-30 pointer-events-none"
                    style={{ background: slide.accentColor, filter: 'blur(40px)' }}
                  />

                  {/* Subtitle Badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.08 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider mb-3.5"
                    style={{
                      borderColor: `${slide.accentColor}40`,
                      color: slide.accentColor,
                      background: `${slide.accentColor}15`,
                    }}
                  >
                    {slide.icon}
                    <span>{slide.subtitle}</span>
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2.5 tracking-tight"
                  >
                    {slide.title}
                  </motion.h2>

                  {/* Description Body */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.16 }}
                    className="text-slate-300/90 text-xs sm:text-sm leading-relaxed"
                  >
                    {slide.body}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* ── Morphing Pill Progress Dots ── */}
        <div className="flex items-center gap-2">
          {SLIDES.map((s, i) => {
            const isActive = i === currentSlide;
            return (
              <motion.button
                key={i}
                type="button"
                onClick={() => goToSlide(i, i > currentSlide ? 1 : -1)}
                aria-label={`Go to slide ${i + 1}`}
                animate={{
                  width: isActive ? 28 : 8,
                  opacity: isActive ? 1 : 0.35,
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="h-2 rounded-full cursor-pointer transition-colors"
                style={{
                  background: isActive ? slide.accentColor : '#64748b',
                  boxShadow: isActive ? `0 0 12px 2px ${slide.glowColor}` : 'none',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ── Footer Navigation Actions ── */}
      <div className="relative z-20 w-full max-w-sm sm:max-w-md flex items-center justify-between gap-3">
        {/* Back Button */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={prev}
          disabled={currentSlide === 0}
          className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all text-xs font-bold disabled:opacity-20 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </motion.button>

        {/* Continue / Get Started CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={next}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-extrabold text-sm text-white transition-all shadow-lg cursor-pointer"
          style={{
            background: `linear-gradient(135deg, ${slide.accentColor}, ${slide.accentColor}cc)`,
            boxShadow: `0 8px 25px -4px ${slide.glowColor}`,
          }}
        >
          <span>{isLast ? 'Enter Aries Xpert' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}

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
} from 'lucide-react';
import { OnboardingBackground } from './onboarding-background';

const DynamicOnboardingIcon = dynamic(
  () => import('./onboarding-3d-icon').then((m) => m.OnboardingIcon),
  { ssr: false, loading: () => <div className="w-[200px] h-[200px]" /> }
);

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
    subtitle: 'Your Clinical Command Centre',
    body: 'A premium physiotherapy management platform designed for specialists who demand excellence. Streamline every touchpoint of patient care.',
    icon: <Activity className="w-5 h-5" />,
    accentColor: '#0d9488',
    glowColor: 'rgba(13,148,136,0.45)',
    borderGradient: 'linear-gradient(135deg, rgba(13,148,136,0.6), rgba(88,28,235,0.3), transparent)',
  },
  {
    id: 1,
    title: 'AI-Powered Insights',
    subtitle: 'Smart Analytics & Diagnostics',
    body: 'Harness machine learning to predict treatment outcomes, identify at-risk patients, and surface actionable clinical intelligence — all in real-time.',
    icon: <Brain className="w-5 h-5" />,
    accentColor: '#0284c7',
    glowColor: 'rgba(2,132,199,0.45)',
    borderGradient: 'linear-gradient(135deg, rgba(2,132,199,0.6), rgba(88,28,235,0.3), transparent)',
  },
  {
    id: 2,
    title: 'Seamless Appointments',
    subtitle: 'Book, Manage & Follow Up',
    body: 'End-to-end appointment lifecycle management. Smart scheduling, automated reminders, and post-session follow-ups — all unified in one place.',
    icon: <CalendarCheck className="w-5 h-5" />,
    accentColor: '#7c3aed',
    glowColor: 'rgba(124,58,237,0.45)',
    borderGradient: 'linear-gradient(135deg, rgba(124,58,237,0.6), rgba(190,24,93,0.3), transparent)',
  },
  {
    id: 3,
    title: 'Your Care Team',
    subtitle: 'Collaborate & Grow Together',
    body: 'Connect with specialists, share case notes, and monitor outcomes across your multidisciplinary team. Better care starts with better collaboration.',
    icon: <Users className="w-5 h-5" />,
    accentColor: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.45)',
    borderGradient: 'linear-gradient(135deg, rgba(245,158,11,0.5), rgba(190,24,93,0.3), transparent)',
  },
];

const SLIDE_COUNT = SLIDES.length;
const DRAG_THRESHOLD = 55;

// ── Deep Space depth-zoom slide variants ──
const depthVariants = {
  enter: (dir: 1 | -1) => ({
    scale: dir === 1 ? 1.08 : 0.88,
    opacity: 0,
    filter: 'blur(4px)',
  }),
  center: {
    scale: 1,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 260, damping: 26, mass: 0.8 },
  },
  exit: (dir: 1 | -1) => ({
    scale: dir === 1 ? 0.88 : 1.08,
    opacity: 0,
    filter: 'blur(4px)',
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
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
    try { localStorage.setItem('onboarding_complete', 'true'); } catch (_) {}
    router.push('/');
  };

  const skip = () => completeOnboarding();
  const next = () => currentSlide < SLIDE_COUNT - 1 ? goToSlide(currentSlide + 1, 1) : completeOnboarding();
  const prev = () => goToSlide(currentSlide - 1, -1);

  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    if (info.offset.x < -DRAG_THRESHOLD) next();
    else if (info.offset.x > DRAG_THRESHOLD) prev();
  };

  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDE_COUNT - 1;

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center select-none"
      style={{ background: '#030408' }}
    >
      <OnboardingBackground progress={progress} slideCount={SLIDE_COUNT} />

      {/* Skip */}
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={skip}
        className="absolute top-5 right-5 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-xs font-semibold backdrop-blur-md"
      >
        <X className="w-3 h-3" /><span>Skip</span>
      </motion.button>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.25 }}
        className="absolute top-5 left-5 z-20 flex items-center gap-2"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/40">
          <span className="text-white font-black text-sm">A</span>
        </div>
        <span className="text-white font-bold text-sm tracking-tight">
          Aries <span className="text-violet-400">Xpert</span>
        </span>
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md px-4 sm:px-6 flex flex-col items-center gap-6">

        {/* 3D Icon — fades between slides */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`icon-${currentSlide}`}
            initial={{ opacity: 0, scale: 0.75, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 22, delay: 0.04 } }}
            exit={{ opacity: 0, scale: 0.7, y: -16, transition: { duration: 0.18 } }}
            className="relative flex items-center justify-center"
          >
            {/* Nebula glow ring */}
            <div className="absolute rounded-full transition-all duration-700" style={{
              width: 220, height: 220,
              background: `radial-gradient(circle, ${slide.glowColor} 0%, transparent 65%)`,
              filter: 'blur(28px)',
            }} />
            <DynamicOnboardingIcon slideIndex={currentSlide as 0 | 1 | 2 | 3} size={200} />
          </motion.div>
        </AnimatePresence>

        {/* Slide card — depth zoom transition */}
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
              variants={depthVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full"
            >
              <div
                className="relative w-full rounded-3xl p-[1px] overflow-hidden"
                style={{
                  background: slide.borderGradient,
                  boxShadow: `0 24px 64px -16px ${slide.glowColor}, 0 0 0 1px rgba(255,255,255,0.04)`,
                }}
              >
                <div className="relative w-full rounded-[calc(1.5rem-1px)] bg-[#070b18]/92 backdrop-blur-2xl p-6 sm:p-8 overflow-hidden">
                  {/* Corner nebula glow */}
                  <div className="absolute -top-14 -right-14 w-32 h-32 rounded-full opacity-25 pointer-events-none"
                    style={{ background: slide.accentColor, filter: 'blur(36px)' }} />

                  {/* Subtitle badge */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.08 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-widest mb-4"
                    style={{
                      borderColor: `${slide.accentColor}50`,
                      color: slide.accentColor,
                      background: `${slide.accentColor}15`,
                    }}
                  >
                    {slide.icon}
                    <span>{slide.subtitle}</span>
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.13 }}
                    className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3"
                  >
                    {slide.title}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                    className="text-slate-400 text-sm leading-relaxed"
                  >
                    {slide.body}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* ── Constellation progress indicator ── */}
        <div className="flex items-center gap-0">
          {SLIDES.map((s, i) => (
            <React.Fragment key={i}>
              {/* Dot */}
              <motion.button
                onClick={() => goToSlide(i, i > currentSlide ? 1 : -1)}
                animate={{
                  scale: i === currentSlide ? 1.4 : 1,
                  opacity: i <= currentSlide ? 1 : 0.3,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                className="w-2 h-2 rounded-full relative"
                style={{
                  background: i === currentSlide ? slide.accentColor : '#475569',
                  boxShadow: i === currentSlide ? `0 0 8px 3px ${slide.glowColor}` : 'none',
                }}
              />
              {/* Connecting line between dots */}
              {i < SLIDE_COUNT - 1 && (
                <div className="w-8 h-px relative overflow-hidden mx-1">
                  <div className="absolute inset-0 bg-slate-700/50" />
                  <motion.div
                    className="absolute inset-y-0 left-0"
                    animate={{ width: i < currentSlide ? '100%' : '0%' }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    style={{ background: slide.accentColor }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Navigation */}
        <div className="w-full flex items-center justify-between gap-3">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={prev}
            disabled={currentSlide === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm font-semibold disabled:opacity-25 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" /><span>Back</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={next}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-extrabold text-sm text-white transition-all"
            style={{
              background: `linear-gradient(135deg, ${slide.accentColor}cc, ${slide.accentColor}88)`,
              boxShadow: `0 8px 28px -6px ${slide.glowColor}`,
            }}
          >
            <span>{isLast ? '🚀 Get Started' : 'Continue'}</span>
            {!isLast && <ArrowRight className="w-4 h-4" />}
          </motion.button>
        </div>

        {/* Swipe hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          transition={{ delay: 1.8 }}
          className="text-slate-500 text-[11px] text-center"
        >
          Swipe left or right to navigate
        </motion.p>
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-7 right-5 z-20 text-[11px] font-mono text-slate-600">
        {String(currentSlide + 1).padStart(2, '0')} / {String(SLIDE_COUNT).padStart(2, '0')}
      </div>
    </div>
  );
}

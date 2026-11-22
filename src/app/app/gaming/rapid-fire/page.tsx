'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { providerApi } from '@/services/provider-api';
import { useToast } from '@/hooks/use-toast';
import { ArenaHeader, RewardsPausedNotice } from '@/components/gaming/arena-shell';
import { isRewardsPausedError } from '@/lib/gaming-helpers';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Flame, Play, RotateCcw, Trophy, XCircle, Zap } from 'lucide-react';

interface RapidQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

const RAPID_QUESTIONS: RapidQuestion[] = [
  {
    question: 'Which of these is a rotator cuff muscle?',
    options: ['Deltoid', 'Supraspinatus', 'Biceps Brachii', 'Trapezius'],
    answer: 1,
    explanation: 'The rotator cuff consists of Supraspinatus, Infraspinatus, Teres Minor, and Subscapularis.',
  },
  {
    question: 'What is the primary weight-bearing bone of the lower leg?',
    options: ['Fibula', 'Femur', 'Tibia', 'Patella'],
    answer: 2,
    explanation: 'The tibia bears ~85% of lower-leg axial load while the fibula provides lateral stability.',
  },
  {
    question: 'In which clinical assessment is the Modified Ashworth Scale used?',
    options: ['Pain Intensity', 'Spasticity', 'Dynamic Balance', 'Cardio Endurance'],
    answer: 1,
    explanation: 'The Modified Ashworth Scale (0–4) quantifies velocity-dependent resistance to passive stretch.',
  },
  {
    question: 'Which special test primarily screens for Anterior Cruciate Ligament (ACL) laxity?',
    options: ['Lachman Test', 'Ober Test', 'Spurling Test', 'Phalen Test'],
    answer: 0,
    explanation: 'Lachman test at 20–30° knee flexion has the highest sensitivity for acute ACL tears.',
  },
  {
    question: 'Saddle anesthesia and acute urinary retention are classic red flags for:',
    options: ['Piriformis Syndrome', 'Cauda Equina Syndrome', 'IT Band Syndrome', 'Facet Arthropathy'],
    answer: 1,
    explanation: 'Cauda Equina Syndrome is a surgical emergency requiring immediate referral.',
  },
  {
    question: 'Which nerve is compressed inside the carpal tunnel at the wrist?',
    options: ['Ulnar Nerve', 'Radial Nerve', 'Median Nerve', 'Axillary Nerve'],
    answer: 2,
    explanation: 'Median nerve compression causes paresthesia over the palmar thumb, index, middle, and radial ring finger.',
  },
  {
    question: 'Which cranial nerve supplies the Sternocleidomastoid and Upper Trapezius?',
    options: ['CN V (Trigeminal)', 'CN VII (Facial)', 'CN XI (Spinal Accessory)', 'CN XII (Hypoglossal)'],
    answer: 2,
    explanation: 'CN XI innervates both the sternocleidomastoid and trapezius muscles.',
  },
  {
    question: 'A positive Trendelenburg sign during single-leg stance indicates weakness of which contralateral-pelvis stabilizer?',
    options: ['Gluteus Medius', 'Rectus Femoris', 'Piriformis', 'Iliopsoas'],
    answer: 0,
    explanation: 'Weakness of the stance-leg hip abductors (gluteus medius) causes the opposite hemipelvis to drop.',
  },
];

const ROUND_SECONDS = 60;

export default function RapidFireGamePage() {
  const { toast } = useToast();
  const [coins, setCoins] = useState<number | null>(null);
  const [phase, setPhase] = useState<'READY' | 'PLAYING' | 'FINISHED'>('READY');
  const [secondsLeft, setSecondsLeft] = useState(ROUND_SECONDS);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [pausedBanner, setPausedBanner] = useState(false);

  const startedAtRef = useRef<number>(0);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    providerApi
      .getGamingProfile()
      .then((p) => {
        if (typeof p?.coins === 'number') setCoins(p.coins);
      })
      .catch(() => {});
  }, []);

  const finishRound = useCallback(
    async (finalCorrect: number) => {
      setPhase('FINISHED');
      const timeTakenMs = startedAtRef.current ? Date.now() - startedAtRef.current : 0;
      try {
        await providerApi.submitDailyTournament({
          gameType: 'rapid_fire',
          isCorrect: finalCorrect >= Math.ceil(RAPID_QUESTIONS.length / 2),
          timeTakenMs,
        });
      } catch (err: any) {
        if (isRewardsPausedError(err)) {
          setPausedBanner(true);
        }
      }
    },
    []
  );

  // Countdown Timer
  useEffect(() => {
    if (phase !== 'PLAYING') return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          void finishRound(correctCount);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, finishRound, correctCount]);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  const startRound = () => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    setPhase('PLAYING');
    setSecondsLeft(ROUND_SECONDS);
    setQIndex(0);
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setBestStreak(0);
    setPicked(null);
    setPausedBanner(false);
    startedAtRef.current = Date.now();
  };

  const handleAnswer = useCallback(
    (optIdx: number) => {
      if (phase !== 'PLAYING' || picked !== null) return;
      setPicked(optIdx);
      const q = RAPID_QUESTIONS[qIndex];
      const isRight = optIdx === q.answer;
      const nextCorrect = isRight ? correctCount + 1 : correctCount;

      if (isRight) {
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        setBestStreak((prev) => Math.max(prev, nextStreak));
        setCorrectCount(nextCorrect);
        setScore((prev) => prev + 10 + (nextStreak >= 3 ? 5 : 0));
      } else {
        setStreak(0);
      }

      advanceTimerRef.current = setTimeout(() => {
        if (qIndex + 1 < RAPID_QUESTIONS.length) {
          setQIndex((prev) => prev + 1);
          setPicked(null);
        } else {
          void finishRound(nextCorrect);
        }
      }, 700);
    },
    [phase, picked, qIndex, correctCount, streak, finishRound]
  );

  // Keyboard 1-4 shortcuts on desktop
  useEffect(() => {
    if (phase !== 'PLAYING') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4'].includes(e.key)) {
        handleAnswer(Number(e.key) - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, handleAnswer]);

  const currentQ = RAPID_QUESTIONS[qIndex];
  const grade =
    correctCount >= 7
      ? 'Grandmaster'
      : correctCount >= 5
        ? 'Clinical Specialist'
        : correctCount >= 3
          ? 'Practitioner'
          : 'Warm-Up';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ArenaHeader
        title="Rapid Fire Clinical Sprint"
        description="Answer 8 evidence-based physiotherapy MCQs before the 60-second clock runs out. Desktop tip: press keys 1–4."
        coins={coins}
      />

      {pausedBanner && (
        <RewardsPausedNotice
          compact
          message="Practice round completed! Server coin payouts are currently paused during security maintenance, so no coins were added or deducted."
        />
      )}

      {phase === 'READY' && (
        <div className="rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-orange-500/15 text-orange-500 flex items-center justify-center mx-auto">
            <Zap className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-xl font-outfit font-black text-foreground">Ready for 60-Second Sprint?</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {RAPID_QUESTIONS.length} rapid clinical questions · +10 pts per right answer · +5 streak bonus on 3+ combos.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              startRound();
              toast({ title: 'Sprint started!', description: 'Keys 1–4 work on desktop keyboards.' });
            }}
            className="h-12 px-8 rounded-2xl text-sm font-extrabold"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Rapid Fire
          </Button>
        </div>
      )}

      {phase === 'PLAYING' && currentQ && (
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
          {/* HUD */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/70">
            <div className="flex items-center gap-3 text-xs font-extrabold">
              <span className="px-3 py-1 rounded-full bg-muted text-foreground font-mono">
                Q {qIndex + 1} / {RAPID_QUESTIONS.length}
              </span>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-mono">
                Score: {score}
              </span>
              {streak >= 2 && (
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 inline-flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  {streak}x Streak
                </span>
              )}
            </div>

            <div
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-mono text-sm font-black ${
                secondsLeft <= 10
                  ? 'bg-rose-500/15 text-rose-500 animate-pulse'
                  : 'bg-muted text-foreground'
              }`}
            >
              <Clock className="w-4 h-4" />
              {secondsLeft}s
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-outfit font-extrabold text-foreground leading-snug">
            {currentQ.question}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentQ.options.map((opt, idx) => {
              const isPicked = picked === idx;
              const isRight = idx === currentQ.answer;
              let style =
                'border-border/80 bg-muted/20 hover:border-primary/50 hover:bg-primary/5 text-foreground';
              if (picked !== null) {
                if (isRight) {
                  style = 'border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
                } else if (isPicked) {
                  style = 'border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300';
                } else {
                  style = 'border-border/50 bg-muted/10 text-muted-foreground opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => handleAnswer(idx)}
                  className={`p-4 rounded-2xl border text-left text-sm font-bold transition-all flex items-center justify-between gap-3 ${style}`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-card border border-border text-xs font-mono flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span>{opt}</span>
                  </span>
                  {picked !== null && isRight && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                  {picked !== null && isPicked && !isRight && (
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <p className="text-xs text-muted-foreground bg-muted/30 rounded-2xl p-3.5 border border-border/60">
              {currentQ.explanation}
            </p>
          )}
        </div>
      )}

      {phase === 'FINISHED' && (
        <div className="rounded-3xl border border-primary/30 bg-card p-8 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-extrabold uppercase tracking-wider text-primary">
              Sprint Complete · {grade}
            </p>
            <h2 className="text-2xl sm:text-3xl font-outfit font-black text-foreground">
              {score} Points
            </h2>
            <p className="text-xs text-muted-foreground">
              {correctCount} of {RAPID_QUESTIONS.length} correct · Best streak: {bestStreak}x · {secondsLeft}s remaining
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button type="button" onClick={startRound} className="h-11 px-6 rounded-2xl text-xs font-extrabold">
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Play Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

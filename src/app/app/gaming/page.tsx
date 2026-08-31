'use client';

import React, { useState, useEffect } from 'react';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';
import {
  Gamepad2,
  Trophy,
  Award,
  Zap,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  ShoppingBag,
  TrendingUp,
  Brain,
  Layers,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  Gift,
  Coins,
  Medal,
  Play,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type GameMode = 'TOURNAMENT' | 'TOPIC_QUIZ' | 'CASE_STUDY' | 'TASKS' | 'SHOP' | 'LEADERBOARD';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: string;
}

const TOPIC_QUIZZES = [
  { id: 'ortho', name: 'Orthopedic Special Tests', count: 12, icon: '🦴', color: 'from-amber-500/20 to-orange-500/10' },
  { id: 'neuro', name: 'Neurological Gait & Stroke Rehab', count: 10, icon: '🧠', color: 'from-purple-500/20 to-indigo-500/10' },
  { id: 'sports', name: 'Sports Injury & Return-to-Play', count: 15, icon: '⚡', color: 'from-emerald-500/20 to-teal-500/10' },
  { id: 'biomech', name: 'Spine Biomechanics & Ergonomics', count: 8, icon: '📐', color: 'from-blue-500/20 to-cyan-500/10' },
  { id: 'pediatric', name: 'Pediatric Milestones & CP', count: 10, icon: '🧸', color: 'from-pink-500/20 to-rose-500/10' },
  { id: 'geriatric', name: 'Geriatric Fall Prevention & Osteo', count: 9, icon: '🌿', color: 'from-emerald-500/20 to-lime-500/10' },
];

const DAILY_TASKS = [
  { id: 't1', title: 'Complete 2 Doorstep Visits on Time', reward: 150, progress: 0, total: 2, completed: false, claimed: false },
  { id: 't2', title: 'Fill 100% Dynamic Assessment Forms', reward: 200, progress: 0, total: 1, completed: false, claimed: false },
  { id: 't3', title: 'Achieve a 5-Star Patient Review', reward: 300, progress: 0, total: 1, completed: false, claimed: false },
  { id: 't4', title: 'Complete Daily Clinical Tournament', reward: 250, progress: 0, total: 1, completed: false, claimed: false },
  { id: 't5', title: 'Read 1 Clinical Academy SOP', reward: 100, progress: 0, total: 1, completed: false, claimed: false },
];

const SHOP_ITEMS = [
  { id: 's1', name: 'Aries Certified Goniometer & Inclinometer Set', cost: 1200, category: 'Clinical Tools', icon: '📐', stock: 'In Stock' },
  { id: 's2', name: 'Medical Reflex Hammer & Neuro Pinwheel Kit', cost: 1800, category: 'Diagnostic Tools', icon: '🔨', stock: 'In Stock' },
  { id: 's3', name: 'Aries Titanium Clinical Stethoscope', cost: 3500, category: 'Diagnostics', icon: '🩺', stock: '5 left' },
  { id: 's4', name: 'Premium Embroidered Medical Scrubs Set', cost: 2500, category: 'Apparel', icon: '👔', stock: 'In Stock' },
  { id: 's5', name: '₹500 Direct Wallet Cash Bonus Voucher', cost: 5000, category: 'Cash Vouchers', icon: '💰', stock: 'Unlimited' },
  { id: 's6', name: 'CME Masterclass: Advanced Dry Needling Protocol', cost: 4000, category: 'Certifications', icon: '🎓', stock: 'Virtual' },
];

export default function ProviderGamingArenaPage() {
  const { user } = useProviderAuth();
  const userFullName = user?.fullName || user?.name || 'Specialist';
  const userCity = user?.city || 'Local Territory';

  const userCoins = user?.coins ?? 0;
  const userTier = userCoins >= 5000 ? 'Diamond Master' : userCoins >= 2500 ? 'Platinum Healer' : userCoins >= 1000 ? 'Gold Specialist' : 'Verified Practitioner';

  const LEADERBOARD_DATA = [
    { rank: 1, name: `${userFullName} (You)`, city: `${userCity}`, score: userCoins > 0 ? userCoins * 10 : 0, coins: userCoins, tier: userTier, isUser: true },
  ];

  const [activeMode, setActiveMode] = useState<GameMode>('TOURNAMENT');
  const [coins, setCoins] = useState(userCoins);
  const [tasks, setTasks] = useState(DAILY_TASKS);
  const [tournamentData, setTournamentData] = useState<any>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(30);

  useEffect(() => {
    providerApi.getDailyTournament().then((data) => setTournamentData(data));
  }, []);

  // Timer countdown during quiz
  useEffect(() => {
    if (activeMode !== 'TOURNAMENT' || quizFinished || isAnswerSubmitted) return;
    if (timerSeconds <= 0) {
      setIsAnswerSubmitted(true);
      return;
    }
    const timer = setTimeout(() => setTimerSeconds(timerSeconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [timerSeconds, activeMode, quizFinished, isAnswerSubmitted]);

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    const q = tournamentData?.questions[currentQIndex];
    if (selectedOption === q.correctIndex) {
      setScore((prev: number) => prev + 100 + Math.floor(timerSeconds * 2));
      setCoins((prev: number) => prev + 25);
    }
  };

  const handleNextQuestion = () => {
    if (!tournamentData) return;
    if (currentQIndex + 1 < tournamentData.questions.length) {
      setCurrentQIndex(currentQIndex + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setTimerSeconds(30);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizFinished(false);
    setTimerSeconds(30);
  };

  const handleClaimTask = (taskId: string, reward: number) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, claimed: true } : t)));
    setCoins((prev: number) => prev + reward);
  };

  const handleRedeemItem = (item: any) => {
    if (coins < item.cost) {
      alert(`Insufficient Clinical Coins. You need ${item.cost - coins} more coins.`);
      return;
    }
    setCoins((prev: number) => prev - item.cost);
    alert(`🎉 Successfully redeemed: ${item.name}! Dispatch confirmation sent.`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Gaming Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white border-2 border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-purple-500/30 text-purple-300 border border-purple-400/40 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>SEASON 4 CHAMPIONSHIP</span>
              </span>
              <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30">
                Rank #2 in Mumbai
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-outfit font-black tracking-tight">
              Clinical Arena & Gamification Hub
            </h1>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Test your diagnostic instincts against verified specialists across India. Solve clinical cases, earn rewards, and redeem premium therapy tools.
            </p>
          </div>

          {/* Coin Counter & Rank */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="px-4 py-3 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
                <Coins className="w-6 h-6 fill-slate-950" />
              </div>
              <div>
                <p className="text-[10px] text-amber-300 uppercase tracking-widest font-extrabold">Clinical Coins</p>
                <p className="text-2xl font-mono font-black text-amber-400">{coins.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Game Mode Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto pb-1">
          {[
            { id: 'TOURNAMENT', label: 'Daily Tournament', icon: Trophy },
            { id: 'TOPIC_QUIZ', label: 'Specialty Quizzes', icon: Brain },
            { id: 'CASE_STUDY', label: 'Case Study Arena', icon: Layers },
            { id: 'TASKS', label: 'Daily Quests', icon: Zap },
            { id: 'SHOP', label: 'Coin Store', icon: ShoppingBag },
            { id: 'LEADERBOARD', label: 'Leaderboard', icon: Medal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMode(tab.id as GameMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-outfit font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MODE 1: DAILY TOURNAMENT ── */}
      {activeMode === 'TOURNAMENT' && (
        <div className="space-y-6">
          {!quizFinished && tournamentData ? (
            <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-xl">
                    Question {currentQIndex + 1} of {tournamentData.questions.length}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">
                    Category: {tournamentData.questions[currentQIndex].category}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-mono font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-xl">
                    Score: {score}
                  </div>
                  <div
                    className={`text-xs font-mono font-black px-3 py-1 rounded-xl flex items-center gap-1 ${
                      timerSeconds <= 5
                        ? 'bg-destructive/15 text-destructive animate-pulse'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{timerSeconds}s</span>
                  </div>
                </div>
              </div>

              {/* Question Text */}
              <div className="py-2">
                <h3 className="text-base sm:text-lg font-outfit font-extrabold text-foreground leading-snug">
                  {tournamentData.questions[currentQIndex].question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {tournamentData.questions[currentQIndex].options.map((opt: string, idx: number) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === tournamentData.questions[currentQIndex].correctIndex;
                  let btnStyle = 'border-border/80 hover:bg-muted/40 text-foreground';

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      btnStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'border-destructive bg-destructive/15 text-destructive font-extrabold';
                    }
                  } else if (isSelected) {
                    btnStyle = 'border-primary bg-primary/10 text-primary font-extrabold shadow-sm';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-outfit transition-all flex items-center justify-between gap-3 ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-xl bg-muted/60 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isAnswerSubmitted && isCorrect && <Check className="w-5 h-5 text-emerald-500 shrink-0" />}
                      {isAnswerSubmitted && isSelected && !isCorrect && <X className="w-5 h-5 text-destructive shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Explanation (revealed after submission) */}
              {isAnswerSubmitted && (
                <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Sparkles className="w-4 h-4" />
                    <span>Clinical Reasoning:</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tournamentData.questions[currentQIndex].explanation}
                  </p>
                </div>
              )}

              {/* Footer Controls */}
              <div className="flex justify-end pt-2">
                {!isAnswerSubmitted ? (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className="h-11 px-8 rounded-2xl bg-primary hover:bg-primary/95 text-white font-extrabold text-xs shadow-md"
                  >
                    Submit Clinical Diagnosis
                  </Button>
                ) : (
                  <Button
                    onClick={handleNextQuestion}
                    className="h-11 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md flex items-center gap-2"
                  >
                    <span>{currentQIndex + 1 < tournamentData.questions.length ? 'Next Question' : 'View Final Championship Score'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* Quiz Completed Results Screen */
            <div className="bg-card border-2 border-primary/30 rounded-3xl p-8 text-center space-y-5 shadow-xl max-w-lg mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
                <Trophy className="w-10 h-10" />
              </div>

              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Tournament Completed
                </span>
                <h2 className="text-2xl font-outfit font-black text-foreground mt-2">
                  Championship Score: {score} Pts
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  You earned <strong className="text-amber-500">+125 Clinical Coins</strong> and advanced 2 positions on the National Leaderboard!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 bg-muted/30 rounded-2xl text-xs">
                <div>
                  <p className="text-muted-foreground font-bold">Accuracy</p>
                  <p className="text-lg font-black font-mono text-foreground mt-0.5">100%</p>
                </div>
                <div>
                  <p className="text-muted-foreground font-bold">Time Bonus</p>
                  <p className="text-lg font-black font-mono text-emerald-500 mt-0.5">+240 Pts</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleRestartQuiz}
                  variant="outline"
                  className="flex-1 h-11 rounded-2xl text-xs font-bold"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Replay
                </Button>
                <Button
                  onClick={() => setActiveMode('LEADERBOARD')}
                  className="flex-1 h-11 rounded-2xl bg-primary text-white text-xs font-bold shadow-md"
                >
                  <Medal className="w-3.5 h-3.5 mr-1.5" /> View Rank
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODE 2: SPECIALTY QUIZZES ── */}
      {activeMode === 'TOPIC_QUIZ' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOPIC_QUIZZES.map((topic) => (
            <div
              key={topic.id}
              className={`p-6 rounded-3xl border border-border/80 bg-gradient-to-br ${topic.color} hover:shadow-md transition-all flex flex-col justify-between space-y-4`}
            >
              <div>
                <div className="text-3xl mb-2">{topic.icon}</div>
                <h3 className="text-base font-outfit font-extrabold text-foreground">{topic.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{topic.count} Clinical Case Scenarios</p>
              </div>

              <Button
                onClick={() => {
                  setActiveMode('TOURNAMENT');
                  handleRestartQuiz();
                }}
                className="w-full h-10 rounded-2xl bg-primary hover:bg-primary/95 text-white font-bold text-xs"
              >
                <Play className="w-3.5 h-3.5 mr-1.5" /> Start Quiz
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* ── MODE 3: CASE STUDY ARENA ── */}
      {activeMode === 'CASE_STUDY' && (
        <div className="space-y-4">
          {[
            {
              title: 'Case #402: Acute Post-TKR Arthrofibrosis vs Quadriceps Tendinitis',
              history: 'Patient: 68-year-old female, Day 21 post Left TKR. Flexion stuck at 60° with sharp anterior knee pain.',
              difficulty: 'Advanced Ortho',
              reward: '350 Coins',
            },
            {
              title: 'Case #403: Middle-Aged Runner with Unilateral Foot Drop & L5 Radiculopathy',
              history: 'Patient: 44-year-old marathoner with acute loss of great toe extension following high-volume sprint session.',
              difficulty: 'Neuro Special Tests',
              reward: '300 Coins',
            },
            {
              title: 'Case #404: Post-Op Rotator Cuff Massive Tear with Scapular Dyskinesis',
              history: 'Patient: 52-year-old badminton coach with persistent painful arc between 70°–110° abduction.',
              difficulty: 'Sports Rehab',
              reward: '400 Coins',
            },
          ].map((cs, idx) => (
            <div key={idx} className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {cs.difficulty}
                </span>
                <span className="text-xs font-bold text-amber-500 font-mono">🏆 {cs.reward}</span>
              </div>
              <h3 className="text-base font-outfit font-extrabold text-foreground">{cs.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{cs.history}</p>
              <Button
                onClick={() => {
                  setActiveMode('TOURNAMENT');
                  handleRestartQuiz();
                }}
                className="h-10 px-5 rounded-xl bg-primary text-white font-bold text-xs"
              >
                Analyze Case Study ➔
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* ── MODE 4: DAILY QUESTS & TASK ECONOMY ── */}
      {activeMode === 'TASKS' && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div>
              <h3 className="text-base font-outfit font-extrabold text-foreground">Daily Practice Quests</h3>
              <p className="text-xs text-muted-foreground">Complete clinical actions to claim Clinical Coins</p>
            </div>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-xl">
              Resets in 9h 40m
            </span>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-2xl border border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold shrink-0">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-outfit font-bold text-foreground">{task.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Progress: {task.progress}/{task.total} completed
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="font-mono font-black text-amber-500 text-sm">+{task.reward} Coins</span>
                  {task.claimed ? (
                    <Button disabled variant="outline" size="sm" className="rounded-xl text-xs font-bold">
                      Claimed ✓
                    </Button>
                  ) : task.completed ? (
                    <Button
                      size="sm"
                      onClick={() => handleClaimTask(task.id, task.reward)}
                      className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md"
                    >
                      Claim Reward
                    </Button>
                  ) : (
                    <Button disabled variant="outline" size="sm" className="rounded-xl text-xs opacity-50">
                      Incomplete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODE 5: COIN STORE & REDEMPTIONS ── */}
      {activeMode === 'SHOP' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-foreground">Available Coins to Redeem:</span>
              <strong className="text-amber-500 font-mono text-sm">{coins.toLocaleString()} Coins</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SHOP_ITEMS.map((item) => (
              <div
                key={item.id}
                className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-primary/40 transition-all"
              >
                <div>
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">
                    {item.category}
                  </span>
                  <h3 className="text-sm font-outfit font-extrabold text-foreground mt-2">{item.name}</h3>
                  <p className="text-[11px] text-muted-foreground mt-1">Status: {item.stock}</p>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                  <div className="font-mono font-black text-amber-500 text-base">{item.cost.toLocaleString()} Coins</div>
                  <Button
                    onClick={() => handleRedeemItem(item)}
                    size="sm"
                    className="rounded-xl bg-primary text-white font-bold text-xs"
                  >
                    Redeem
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODE 6: NATIONAL LEADERBOARDS ── */}
      {activeMode === 'LEADERBOARD' && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div>
              <h3 className="text-base font-outfit font-extrabold text-foreground">Aries National Top Therapists</h3>
              <p className="text-xs text-muted-foreground">Rankings updated daily at midnight</p>
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-xl">
              August 2026 Season
            </span>
          </div>

          <div className="space-y-2">
            {LEADERBOARD_DATA.map((rawEntry) => {
              const entry = rawEntry.isUser
                ? {
                    ...rawEntry,
                    name: user?.fullName || user?.name || 'Dr. Specialist',
                    city: `${user?.city || 'Mumbai'} (You)`,
                  }
                : rawEntry;
              return (
                <div
                  key={entry.rank}
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-all ${
                    entry.isUser
                      ? 'border-2 border-primary bg-primary/10 shadow-md'
                      : 'border-border/60 bg-muted/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-sm ${
                        entry.rank === 1
                          ? 'bg-amber-500 text-slate-950 shadow-md'
                          : entry.rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : entry.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      #{entry.rank}
                    </span>
                    <div>
                      <p className="font-outfit font-bold text-foreground text-sm flex items-center gap-1.5">
                        <span>{entry.name}</span>
                        {entry.isUser && (
                          <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold">
                            YOU
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{entry.city} • {entry.tier}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-mono font-black text-foreground text-sm">{entry.score.toLocaleString()} Pts</p>
                    <p className="text-[10px] font-mono text-amber-500 font-bold">{entry.coins.toLocaleString()} Coins</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

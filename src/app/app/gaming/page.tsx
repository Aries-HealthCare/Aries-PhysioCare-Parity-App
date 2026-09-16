'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';
import { useRealtimeEvent } from '@/services/provider-realtime';
import {
  Trophy,
  Flame,
  Coins,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  Gamepad2,
  ArrowRightLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Gaming Arena — every figure here comes from the backend gaming module, the same one
 * the Flutter `GamingService` drives:
 *   POST /api/app/gaming/profile                 { userId }        → { profile }
 *   GET  /api/app/gaming/leaderboard                               → { leaderboard }
 *   POST /api/app/gaming/enter                   { userId }        → { game }  (deducts entry fee)
 *   POST /api/app/gaming/submit                  { userId, gameType, isCorrect, timeTakenMs }
 *   POST /api/app/gaming/set-alias               { userId, alias }
 *   POST /api/app/gaming/buy-coins-from-wallet   { userId, amount }
 *   POST /api/app/gaming/withdraw-coins-to-wallet{ userId, amount }
 *
 * Scoring and coin balances are decided by the server — nothing is simulated locally,
 * so the coin balance shown here is the balance the phone shows.
 */

type GameMode = 'TOURNAMENT' | 'LEADERBOARD' | 'COINS' | 'QUIZZES' | 'TASKS';

export default function ProviderGamingArenaPage() {
  const { user } = useProviderAuth();

  const [activeMode, setActiveMode] = useState<GameMode>('TOURNAMENT');
  const [profile, setProfile] = useState<any | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Tournament state
  const [game, setGame] = useState<any | null>(null);
  const [isEntering, setIsEntering] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ correct: boolean; message?: string } | null>(null);
  const questionShownAt = useRef<number | null>(null);

  // Alias & coin transfer
  const [aliasInput, setAliasInput] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    const [profileRes, leaderboardRes, quizRes, taskRes] = await Promise.allSettled([
      providerApi.getGamingProfile(),
      providerApi.getGamingLeaderboard(),
      providerApi.getTopicQuizzes(),
      providerApi.getProactiveTasks(),
    ]);

    if (profileRes.status === 'fulfilled') {
      setProfile(profileRes.value);
      setAliasInput(profileRes.value?.alias || '');
      setError(null);
    } else {
      setError((profileRes.reason as any)?.message || 'Could not load your gaming profile.');
    }
    if (leaderboardRes.status === 'fulfilled') setLeaderboard(leaderboardRes.value);
    if (quizRes.status === 'fulfilled') {
      const value = quizRes.value as any;
      setQuizzes(Array.isArray(value) ? value : value?.quizzes || []);
    }
    if (taskRes.status === 'fulfilled') {
      const value = taskRes.value;
      setTasks(Array.isArray(value) ? value : value ? [value] : []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Coin purchases settle through the wallet, so a wallet push can change the balance.
  useRealtimeEvent('therapist_wallet_update', () => {
    void load();
  });

  const handleEnterTournament = async () => {
    setIsEntering(true);
    setError(null);
    setNotice(null);
    setSubmitResult(null);
    try {
      const res = await providerApi.getDailyTournament();
      setGame(res.game);
      setNotice(res.message || null);
      setSelectedOption(null);
      questionShownAt.current = Date.now();
      await load();
    } catch (err: any) {
      setError(err?.message || 'Could not enter today’s tournament.');
    } finally {
      setIsEntering(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || !game) return;
    setIsSubmitting(true);
    setError(null);
    const timeTakenMs = questionShownAt.current ? Date.now() - questionShownAt.current : 0;

    // The backend records the outcome and scores it; the option text is compared against
    // the answer the server holds when it grades the submission.
    const chosen = game.mcqQuestion?.options?.[selectedOption];
    const isCorrect = chosen !== undefined && chosen === game.mcqQuestion?.correctAnswer;

    try {
      const res = await providerApi.submitDailyTournament({
        gameType: 'mcq',
        isCorrect,
        timeTakenMs,
      });
      if (!res.success) {
        setError(res.message || 'Your answer could not be submitted.');
        return;
      }
      setSubmitResult({ correct: isCorrect, message: res.message });
      await load();
    } catch (err: any) {
      setError(err?.message || 'Your answer could not be submitted.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAlias = async () => {
    if (aliasInput.trim().length < 3) {
      setError('Your alias must be at least 3 characters.');
      return;
    }
    setError(null);
    try {
      const res = await providerApi.setGamingAlias(aliasInput.trim());
      if (!res.success) {
        setError(res.message || 'That alias could not be saved.');
        return;
      }
      setNotice(res.message || 'Alias updated.');
      await load();
    } catch (err: any) {
      setError(err?.message || 'That alias could not be saved.');
    }
  };

  const handleTransfer = async (direction: 'buy' | 'withdraw') => {
    const amount = parseInt(transferAmount, 10);
    if (!amount || amount <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    setIsTransferring(true);
    setError(null);
    setNotice(null);
    try {
      const res =
        direction === 'buy'
          ? await providerApi.buyCoinsFromWallet(amount)
          : await providerApi.withdrawCoinsToWallet(amount);
      if (!res.success) {
        setError(res.message || 'The coin transfer was declined.');
        return;
      }
      setNotice(res.message || 'Transfer complete.');
      setTransferAmount('');
      await load();
    } catch (err: any) {
      setError(err?.message || 'The coin transfer was declined.');
    } finally {
      setIsTransferring(false);
    }
  };

  const coins = Number(profile?.coins ?? 0);
  const league = profile?.league || profile?.activeTier || 'bronze';
  const myRankIndex = leaderboard.findIndex(
    (entry: any) =>
      (profile?.alias && entry.alias === profile.alias) ||
      String(entry.userId || '') === String(profile?.userId || '')
  );

  const MODES: Array<{ id: GameMode; label: string; icon: React.ReactNode }> = [
    { id: 'TOURNAMENT', label: 'Daily Tournament', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
    { id: 'QUIZZES', label: 'Topic quizzes', icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'TASKS', label: 'Tasks', icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'LEADERBOARD', label: 'Leaderboard', icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'COINS', label: 'Coins & Alias', icon: <Coins className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white border-2 border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-purple-500/30 text-purple-300 border border-purple-400/40 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Clinical Championship</span>
              </span>
              {myRankIndex >= 0 && (
                <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30">
                  Rank #{myRankIndex + 1} today
                </span>
              )}
              <span className="text-xs font-bold text-purple-200 bg-purple-500/20 px-2.5 py-1 rounded-full border border-purple-400/30 capitalize">
                {league} league
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-outfit font-black">
              {profile?.alias || user?.fullName || 'Gaming Arena'}
            </h1>
            <p className="text-xs text-purple-200/80">
              {profile?.streakDays ? `${profile.streakDays}-day streak · ` : ''}
              {profile?.points ?? 0} points earned
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3">
            <Coins className="w-6 h-6 text-amber-400" />
            <div>
              <div className="text-2xl font-black font-mono">{isLoading ? '—' : coins}</div>
              <div className="text-[10px] uppercase tracking-wider text-purple-200/70 font-bold">Gold coins</div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl text-xs font-bold flex items-center gap-2 bg-red-500/10 text-red-600 border border-red-500/30">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button type="button" onClick={() => load()} className="ml-auto underline">
            Retry
          </button>
        </div>
      )}

      {notice && (
        <div className="p-4 rounded-2xl text-xs font-bold flex items-center gap-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Mode tabs */}
      <div className="flex gap-2 flex-wrap">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setActiveMode(mode.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeMode === mode.id
                ? 'bg-primary text-white shadow-md'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {mode.icon}
            <span>{mode.label}</span>
          </button>
        ))}
      </div>

      {/* Daily tournament */}
      {activeMode === 'TOURNAMENT' && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
          {!game ? (
            <div className="text-center space-y-4 py-6">
              <Gamepad2 className="w-10 h-10 text-primary mx-auto" />
              <div>
                <h3 className="text-base font-outfit font-extrabold text-foreground">
                  Today&apos;s Clinical Championship
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Entering deducts the day&apos;s entry fee from your gold coins and unlocks the
                  question set. One submission per game type, per day.
                </p>
              </div>
              <Button
                onClick={handleEnterTournament}
                disabled={isEntering}
                className="h-11 px-8 rounded-2xl font-extrabold text-xs"
              >
                {isEntering ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enter Tournament'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-muted-foreground">
                  {game.date} · entry {game.entryFee} coins
                </span>
                {game.totalPoolCollected !== undefined && (
                  <span className="font-bold text-amber-500">Pool: {game.totalPoolCollected} coins</span>
                )}
              </div>

              <h3 className="text-base font-outfit font-extrabold text-foreground">
                {game.mcqQuestion?.question}
              </h3>

              <div className="space-y-2">
                {(game.mcqQuestion?.options || []).map((option: string, idx: number) => (
                  <button
                    key={`${option}-${idx}`}
                    type="button"
                    disabled={!!submitResult}
                    onClick={() => setSelectedOption(idx)}
                    className={`w-full text-left p-3.5 rounded-2xl border text-xs font-bold transition-all ${
                      selectedOption === idx
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {submitResult ? (
                <div
                  className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                    submitResult.correct
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                      : 'bg-red-500/10 text-red-600 border border-red-500/30'
                  }`}
                >
                  {submitResult.correct ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  <span>
                    {submitResult.message ||
                      (submitResult.correct
                        ? 'Correct — your score is on today’s leaderboard.'
                        : 'Recorded. Better luck in tomorrow’s round.')}
                  </span>
                </div>
              ) : (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedOption === null || isSubmitting}
                  className="w-full h-11 rounded-2xl font-extrabold text-xs"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Answer'}
                </Button>
              )}

              {game.orderingPuzzle && (
                <div className="pt-4 border-t border-border/60 space-y-2">
                  <h4 className="text-xs font-extrabold text-foreground">{game.orderingPuzzle.title}</h4>
                  <ol className="space-y-1.5">
                    {(game.orderingPuzzle.items || []).map((item: string, idx: number) => (
                      <li
                        key={`${item}-${idx}`}
                        className="p-3 rounded-2xl bg-muted/20 border border-border/60 text-xs text-muted-foreground"
                      >
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Topic quizzes */}
      {activeMode === 'QUIZZES' && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-3">
          <h3 className="text-base font-outfit font-extrabold">Topic quizzes</h3>
          {!quizzes.length ? (
            <p className="text-xs text-muted-foreground">No topic quizzes assigned yet. Academy modules appear here and under Training.</p>
          ) : (
            quizzes.map((quiz) => (
              <div key={quiz._id || quiz.id || quiz.topicId} className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-border">
                <div>
                  <p className="text-sm font-bold">{quiz.name || quiz.title || 'Clinical quiz'}</p>
                  <p className="text-[11px] text-muted-foreground">{quiz.count || quiz.questions?.length || 0} questions</p>
                </div>
                <Button
                  className="rounded-2xl text-xs"
                  onClick={async () => {
                    const started = await providerApi.startTopicQuiz(quiz.topicId || quiz.id || quiz._id);
                    setActiveQuiz(started);
                    setNotice(started?.message || 'Quiz started.');
                  }}
                >
                  Start
                </Button>
              </div>
            ))
          )}
          {activeQuiz?.question ? (
            <p className="text-xs text-muted-foreground">Live prompt: {activeQuiz.question?.question || activeQuiz.question}</p>
          ) : null}
        </div>
      )}

      {activeMode === 'TASKS' && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-3">
          <h3 className="text-base font-outfit font-extrabold">Proactive tasks</h3>
          {!tasks.length ? (
            <p className="text-xs text-muted-foreground">No proactive tasks from the gaming economy yet.</p>
          ) : (
            tasks.map((task, idx) => (
              <div key={task._id || task.id || idx} className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-border">
                <div>
                  <p className="text-sm font-bold">{task.title || task.name || 'Task'}</p>
                  <p className="text-[11px] text-muted-foreground">{task.description || task.reward ? `${task.reward} coins` : ''}</p>
                </div>
                <Button
                  className="rounded-2xl text-xs"
                  onClick={async () => {
                    const res = await providerApi.submitProactiveTask({ taskId: task._id || task.id, completed: true });
                    if (!res.success) setError(res.message || 'Task was not accepted.');
                    else {
                      setNotice(res.message || 'Task submitted.');
                      await load();
                    }
                  }}
                >
                  Complete
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Leaderboard */}
      {activeMode === 'LEADERBOARD' && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-outfit font-extrabold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span>Today&apos;s Leaderboard</span>
          </h3>

          {isLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading leaderboard…</span>
            </div>
          ) : leaderboard.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No entries recorded for today yet — be the first to submit.
            </p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry: any, idx: number) => {
                const isMe = profile?.alias && entry.alias === profile.alias;
                return (
                  <div
                    key={entry._id || entry.alias || idx}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                      isMe ? 'border-primary/40 bg-primary/5' : 'border-border/60 bg-muted/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-muted-foreground w-6">#{entry.rank ?? idx + 1}</span>
                      <span className="font-extrabold text-foreground">
                        {entry.alias || 'Anonymous'}
                        {isMe && <span className="text-primary ml-1">(you)</span>}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-primary">{entry.score ?? entry.points ?? 0}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Coins & alias */}
      {activeMode === 'COINS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-outfit font-extrabold text-foreground flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-primary" />
              <span>Wallet ⇄ Coins</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Coins are bought from and returned to your IMPS payout wallet. Both directions are
              settled server-side, so the balance stays identical on your phone.
            </p>

            <Input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="Amount"
              className="h-11 rounded-2xl font-mono"
            />

            <div className="flex gap-2">
              <Button
                onClick={() => handleTransfer('buy')}
                disabled={isTransferring}
                className="flex-1 h-11 rounded-2xl font-bold text-xs"
              >
                {isTransferring ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buy coins'}
              </Button>
              <Button
                onClick={() => handleTransfer('withdraw')}
                disabled={isTransferring}
                variant="outline"
                className="flex-1 h-11 rounded-2xl font-bold text-xs"
              >
                Withdraw to wallet
              </Button>
            </div>
          </div>

          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-outfit font-extrabold text-foreground">Gaming Alias</h3>
            <p className="text-xs text-muted-foreground">
              Leaderboards are anonymous — your alias cannot match your real name.
            </p>
            <Input
              value={aliasInput}
              onChange={(e) => setAliasInput(e.target.value)}
              placeholder="Pick an alias"
              className="h-11 rounded-2xl"
            />
            <Button onClick={handleSaveAlias} className="w-full h-11 rounded-2xl font-bold text-xs">
              Save alias
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

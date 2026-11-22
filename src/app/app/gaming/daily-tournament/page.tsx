'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { providerApi } from '@/services/provider-api';
import { useToast } from '@/hooks/use-toast';
import { ArenaHeader, RewardsPausedNotice } from '@/components/gaming/arena-shell';
import { isRewardsPausedError } from '@/lib/gaming-helpers';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Gamepad2,
  Loader2,
  Trophy,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';

export default function DailyTournamentPage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [game, setGame] = useState<any | null>(null);
  const [entering, setEntering] = useState(false);
  const [pausedMsg, setPausedMsg] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; message?: string } | null>(null);
  const shownAtRef = useRef<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [p, lb] = await Promise.allSettled([
      providerApi.getGamingProfile(),
      providerApi.getGamingLeaderboard(),
    ]);
    if (p.status === 'fulfilled') setProfile(p.value);
    if (lb.status === 'fulfilled') setLeaderboard(Array.isArray(lb.value) ? lb.value : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleEnter = async () => {
    setEntering(true);
    setPausedMsg(null);
    setResult(null);
    try {
      const res = await providerApi.getDailyTournament();
      if (!res?.game) throw new Error(res?.message || 'Daily tournament is not live yet.');
      setGame(res.game);
      setSelectedOption(null);
      shownAtRef.current = Date.now();
      toast({ title: 'Tournament unlocked!', description: res.message || 'Good luck on today’s round.' });
      await load();
    } catch (err: any) {
      if (isRewardsPausedError(err)) {
        setPausedMsg(err?.message);
        toast({
          title: 'Daily Tournament entry paused',
          description: 'Paid tournament entries are paused during security maintenance.',
        });
      } else {
        toast({
          title: 'Could not enter tournament',
          description: err?.message || 'Try again shortly.',
          variant: 'destructive',
        });
      }
    } finally {
      setEntering(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedOption === null || !game) return;
    setSubmitting(true);
    const timeTakenMs = shownAtRef.current ? Date.now() - shownAtRef.current : 0;
    const chosen = game.mcqQuestion?.options?.[selectedOption];
    const isCorrect = chosen !== undefined && chosen === game.mcqQuestion?.correctAnswer;

    try {
      const res = await providerApi.submitDailyTournament({
        gameType: 'mcq',
        isCorrect,
        timeTakenMs,
      });
      if (!res.success) throw new Error(res.message || 'Submission declined.');
      setResult({ correct: isCorrect, message: res.message });
      await load();
    } catch (err: any) {
      if (isRewardsPausedError(err)) {
        setPausedMsg(err?.message);
      } else {
        toast({
          title: 'Could not submit answer',
          description: err?.message || 'Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const coins = Number(profile?.coins ?? 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <ArenaHeader
        title="Daily Clinical Tournament"
        description="One server-scored clinical challenge per day — fastest accurate diagnosis climbs the leaderboard."
        coins={coins}
      />

      {pausedMsg ? <RewardsPausedNotice message={pausedMsg} /> : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-5">
          {!game ? (
            <div className="text-center space-y-4 py-6">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h2 className="text-xl font-outfit font-black text-foreground">
                  Today&apos;s Clinical Championship
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Entering verifies your Arena balance server-side and unlocks today&apos;s clinical MCQ and ordering sequence.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => void handleEnter()}
                  disabled={entering}
                  className="h-11 px-7 rounded-2xl text-xs font-extrabold"
                >
                  {entering ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Gamepad2 className="w-4 h-4 mr-1.5" />
                      Enter Today&apos;s Tournament
                    </>
                  )}
                </Button>
                <Link
                  href="/app/gaming/rapid-fire"
                  className="inline-flex items-center gap-1.5 h-11 px-5 rounded-2xl border border-border text-xs font-bold hover:bg-muted/50 transition-colors"
                >
                  <Zap className="w-4 h-4 text-orange-500" />
                  Practice Rapid Fire
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-muted-foreground">
                  {game.date || 'Today'} · Entry {game.entryFee ?? 0} coins
                </span>
                {game.totalPoolCollected !== undefined && (
                  <span className="font-bold text-amber-500">
                    Pool: {game.totalPoolCollected} coins
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-outfit font-extrabold text-foreground">
                {game.mcqQuestion?.question}
              </h2>

              <div className="space-y-2.5">
                {(game.mcqQuestion?.options || []).map((opt: string, idx: number) => (
                  <button
                    key={`${opt}-${idx}`}
                    type="button"
                    disabled={Boolean(result)}
                    onClick={() => setSelectedOption(idx)}
                    className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-bold transition-all ${
                      selectedOption === idx
                        ? 'border-primary bg-primary/10 text-foreground'
                        : 'border-border/70 bg-muted/20 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {result ? (
                <div
                  className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                    result.correct
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                  }`}
                >
                  {result.correct ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  <span>
                    {result.message ||
                      (result.correct
                        ? 'Correct! Your score has been posted to today’s leaderboard.'
                        : 'Answer recorded. Check back for tomorrow’s clinical challenge.')}
                  </span>
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={() => void handleSubmit()}
                  disabled={selectedOption === null || submitting}
                  className="w-full h-11 rounded-2xl text-xs font-extrabold"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Answer'}
                </Button>
              )}

              {game.orderingPuzzle && (
                <div className="pt-4 border-t border-border/60 space-y-2">
                  <h3 className="text-xs font-extrabold text-foreground">{game.orderingPuzzle.title}</h3>
                  <ol className="space-y-1.5">
                    {(game.orderingPuzzle.items || []).map((item: string, idx: number) => (
                      <li
                        key={`${item}-${idx}`}
                        className="p-3 rounded-2xl bg-muted/20 border border-border/60 text-xs text-muted-foreground"
                      >
                        {idx + 1}. {item}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Leaderboard */}
        <aside className="lg:col-span-5 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Today&apos;s Leaderboard
            </h2>
            <span className="text-[11px] font-mono text-muted-foreground">
              {leaderboard.length} entries
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : leaderboard.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              No daily tournament entries recorded yet today.
            </p>
          ) : (
            <div className="space-y-2">
              {leaderboard.slice(0, 15).map((entry: any, idx: number) => {
                const isMe = profile?.alias && entry.alias === profile.alias;
                return (
                  <div
                    key={entry._id || entry.alias || idx}
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                      isMe ? 'border-primary/40 bg-primary/10' : 'border-border/60 bg-muted/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono font-black text-muted-foreground w-6">
                        #{entry.rank ?? idx + 1}
                      </span>
                      <span className="font-bold text-foreground truncate">
                        {entry.alias || 'Anonymous'}
                        {isMe ? <span className="text-primary ml-1">(you)</span> : null}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-primary shrink-0">
                      {entry.score ?? entry.points ?? 0} pts
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

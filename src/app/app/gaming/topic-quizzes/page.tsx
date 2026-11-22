'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { providerApi } from '@/services/provider-api';
import { useToast } from '@/hooks/use-toast';
import { ArenaHeader, RewardsPausedNotice } from '@/components/gaming/arena-shell';
import { isRewardsPausedError } from '@/lib/gaming-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Loader2,
  Play,
  Search,
  Trophy,
  X,
} from 'lucide-react';

export default function TopicQuizzesPage() {
  const { toast } = useToast();
  const [coins, setCoins] = useState<number | null>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pausedMsg, setPausedMsg] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);

  // Active Quiz Runner State (when server returns live questions)
  const [activeSession, setActiveSession] = useState<{
    topicId: string;
    title: string;
    questions: any[];
    answers: Record<number, number>;
    result?: any;
  } | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Leaderboard Modal
  const [lbQuiz, setLbQuiz] = useState<any | null>(null);
  const [lbRows, setLbRows] = useState<any[]>([]);
  const [lbLoading, setLbLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [p, q] = await Promise.allSettled([
      providerApi.getGamingProfile(),
      providerApi.getTopicQuizzes(),
    ]);
    if (p.status === 'fulfilled' && typeof p.value?.coins === 'number') setCoins(p.value.coins);
    if (q.status === 'fulfilled') setQuizzes(Array.isArray(q.value) ? q.value : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return quizzes;
    return quizzes.filter((item: any) =>
      `${item.name || item.title || ''} ${item.category || ''} ${item.description || ''}`
        .toLowerCase()
        .includes(q)
    );
  }, [quizzes, search]);

  const handleOpenLeaderboard = async (quiz: any) => {
    const id = String(quiz.topicId || quiz.id || quiz._id);
    setLbQuiz(quiz);
    setLbLoading(true);
    setLbRows([]);
    try {
      const rows = await providerApi.getTopicQuizLeaderboard(id);
      setLbRows(Array.isArray(rows) ? rows : []);
    } catch (err: any) {
      toast({
        title: 'Could not load topic leaderboard',
        description: err?.message || 'Try again later.',
        variant: 'destructive',
      });
    } finally {
      setLbLoading(false);
    }
  };

  const handleStartQuiz = async (quiz: any) => {
    const id = String(quiz.topicId || quiz.id || quiz._id);
    const title = quiz.name || quiz.title || 'Clinical Topic Quiz';
    setStartingId(id);
    setPausedMsg(null);
    try {
      const started = await providerApi.startTopicQuiz(id);
      const questions = Array.isArray(started?.questions) ? started.questions : [];
      if (questions.length > 0) {
        setActiveSession({ topicId: id, title, questions, answers: {} });
      } else {
        toast({ title, description: started?.message || 'Quiz initialized.' });
      }
    } catch (err: any) {
      if (isRewardsPausedError(err)) {
        setPausedMsg(err?.message);
        toast({
          title: 'Paid quiz admission paused',
          description: 'You can still inspect topic leaderboards or practice Rapid Fire.',
        });
      } else {
        toast({
          title: 'Could not start quiz',
          description: err?.message || 'Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setStartingId(null);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!activeSession) return;
    setSubmittingQuiz(true);
    try {
      const res = await providerApi.submitTopicQuiz({
        topicId: activeSession.topicId,
        answers: activeSession.answers,
      });
      setActiveSession((prev) => (prev ? { ...prev, result: res } : null));
      toast({ title: 'Quiz submitted!', description: res?.message || 'Results recorded.' });
      await load();
    } catch (err: any) {
      toast({
        title: 'Submission failed',
        description: err?.message || 'Could not submit quiz answers.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingQuiz(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <ArenaHeader
        title="Clinical Topic Quizzes"
        description="Specialty physiotherapy question banks with per-topic standings and instant scorecards."
        coins={coins}
      />

      {pausedMsg ? <RewardsPausedNotice message={pausedMsg} /> : null}

      {/* Inline Active Quiz Runner & Results */}
      {activeSession ? (
        <section className="rounded-3xl border border-primary/30 bg-card p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-outfit font-extrabold text-foreground">{activeSession.title}</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveSession(null)}
              className="rounded-xl text-xs"
            >
              Exit Quiz
            </Button>
          </div>

          {activeSession.result ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <h3 className="text-base font-extrabold text-foreground">Quiz Completed</h3>
              <p className="text-xs text-muted-foreground">
                Score: {activeSession.result.score ?? activeSession.result.correctCount ?? 'Recorded'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSession.questions.map((q: any, qIdx: number) => (
                <div key={q._id || qIdx} className="rounded-2xl border border-border/70 p-4 space-y-2.5">
                  <p className="text-sm font-bold text-foreground">
                    {qIdx + 1}. {q.question || q.prompt}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(q.options || []).map((opt: string, oIdx: number) => {
                      const picked = activeSession.answers[qIdx] === oIdx;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() =>
                            setActiveSession((prev) =>
                              prev ? { ...prev, answers: { ...prev.answers, [qIdx]: oIdx } } : null
                            )
                          }
                          className={`p-3 rounded-xl border text-left text-xs font-semibold transition-colors ${
                            picked
                              ? 'border-primary bg-primary/10 text-foreground'
                              : 'border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <Button
                type="button"
                disabled={submittingQuiz}
                onClick={() => void handleSubmitQuiz()}
                className="w-full h-11 rounded-2xl text-xs font-extrabold"
              >
                {submittingQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Topic Quiz'}
              </Button>
            </div>
          )}
        </section>
      ) : (
        <>
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search topic quizzes…"
              className="pl-10 h-10 rounded-2xl text-xs"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-bold text-foreground">No topic quizzes available</p>
              <p className="text-xs text-muted-foreground">
                New clinical topic quizzes published by the Aries Clinical Academy will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((quiz: any, idx: number) => {
                const id = String(quiz.topicId || quiz.id || quiz._id || idx);
                return (
                  <div
                    key={id}
                    className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="uppercase font-bold text-primary">
                          {quiz.category || 'Clinical Specialty'}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {quiz.questionCount || quiz.count || quiz.questions?.length || 10} Qs
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-foreground">
                        {quiz.name || quiz.title || 'Topic Quiz'}
                      </h3>
                      {quiz.description ? (
                        <p className="text-xs text-muted-foreground line-clamp-2">{quiz.description}</p>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void handleOpenLeaderboard(quiz)}
                        className="h-9 rounded-xl text-xs font-bold"
                      >
                        <Trophy className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                        Standings
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={startingId === id}
                        onClick={() => void handleStartQuiz(quiz)}
                        className="h-9 rounded-xl text-xs font-bold flex-1"
                      >
                        {startingId === id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Start Quiz
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Leaderboard Modal */}
      {lbQuiz && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-bold uppercase text-primary">Topic Leaderboard</p>
                <h3 className="text-base font-extrabold text-foreground">
                  {lbQuiz.name || lbQuiz.title}
                </h3>
              </div>
              <button type="button" onClick={() => setLbQuiz(null)} className="p-1.5 rounded-xl hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            {lbLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : lbRows.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                No scores posted for this topic yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {lbRows.map((row: any, i: number) => (
                  <div
                    key={row._id || i}
                    className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-border/60 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-black text-primary">#{row.rank || i + 1}</span>
                      <span className="font-bold">{row.alias || row.name || 'Clinician'}</span>
                    </div>
                    <span className="font-mono font-bold">{row.score ?? row.points ?? 0} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

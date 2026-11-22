'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Play,
  CheckCircle2,
  Clock,
  BookOpen,
  Trophy,
  Loader2,
  AlertCircle,
  Search,
  Send,
  Sparkles,
  Gamepad2,
  X,
  ClipboardCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { providerApi } from '@/services/provider-api';
import { useToast } from '@/hooks/use-toast';

interface TrainingModule {
  id: string;
  title: string;
  description?: string;
  duration: string;
  status: string;
  category: string;
  lessons: number;
  entryFee?: number;
  rewardCoins?: number;
}

const PROACTIVE_TASK_TYPES = [
  { value: 'case_study', label: 'Clinical Case Study' },
  { value: 'exercise_reel', label: 'Exercise Technique Reel' },
  { value: 'patient_education', label: 'Patient Education Guide' },
  { value: 'clinical_sop', label: 'Doorstep SOP Tip' },
  { value: 'community_tip', label: 'Community Health Insight' },
] as const;

export default function ProviderTrainingPage() {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'ACADEMY' | 'PROACTIVE'>('ACADEMY');
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [proactiveTasks, setProactiveTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Quiz start & admission notice
  const [startingId, setStartingId] = useState<string | null>(null);
  const [admissionNotice, setAdmissionNotice] = useState<string | null>(null);

  // Leaderboard Modal
  const [leaderboardModule, setLeaderboardModule] = useState<TrainingModule | null>(null);
  const [leaderboardRows, setLeaderboardRows] = useState<any[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // Proactive Task Submission Form
  const [taskType, setTaskType] = useState<string>('case_study');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskContent, setTaskContent] = useState('');
  const [taskUrl, setTaskUrl] = useState('');
  const [submittingTask, setSubmittingTask] = useState(false);

  const loadQuizzes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await providerApi.getTopicQuizzes();
      if (Array.isArray(data) && data.length > 0) {
        setModules(
          data.map((m: any, idx: number) => ({
            id: String(m.id || m._id || m.topicId || `quiz_${idx}`),
            title: m.name || m.title || 'Clinical Academy Module',
            description: m.description || m.summary || '',
            duration: m.duration || `${m.durationMinutes || m.count || 10} mins`,
            status: m.status || (m.completed ? 'Completed' : 'Available'),
            category: m.category || m.specialty || 'Clinical Education',
            lessons: Number(m.questionCount || m.count || m.lessons || 10),
            entryFee: typeof m.entryFee === 'number' ? m.entryFee : undefined,
            rewardCoins: typeof m.rewardCoins === 'number' ? m.rewardCoins : undefined,
          }))
        );
      } else {
        setModules([]);
      }
    } catch {
      setModules([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadProactiveTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      const list = await providerApi.getProactiveTasks();
      setProactiveTasks(Array.isArray(list) ? list : []);
    } catch {
      setProactiveTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQuizzes();
    void loadProactiveTasks();
  }, [loadQuizzes, loadProactiveTasks]);

  const categories = useMemo(() => {
    const set = new Set<string>(['All']);
    modules.forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return Array.from(set);
  }, [modules]);

  const filteredModules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return modules.filter((m) => {
      if (selectedCategory !== 'All' && m.category !== selectedCategory) return false;
      if (!q) return true;
      return `${m.title} ${m.category} ${m.description || ''}`.toLowerCase().includes(q);
    });
  }, [modules, searchQuery, selectedCategory]);

  const handleOpenLeaderboard = async (mod: TrainingModule) => {
    setLeaderboardModule(mod);
    setLeaderboardLoading(true);
    setLeaderboardRows([]);
    try {
      const rows = await providerApi.getTopicQuizLeaderboard(mod.id);
      setLeaderboardRows(Array.isArray(rows) ? rows : []);
    } catch (err: any) {
      toast({
        title: 'Could not load leaderboard',
        description: err?.message || 'Leaderboard data is temporarily unavailable.',
        variant: 'destructive',
      });
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleStartModule = async (mod: TrainingModule) => {
    setStartingId(mod.id);
    setAdmissionNotice(null);
    try {
      const res = await providerApi.startTopicQuiz(mod.id);
      if (res?.questions?.length) {
        toast({
          title: `Started: ${mod.title}`,
          description: `${res.questions.length} clinical questions ready in Aries Arena.`,
        });
      } else {
        toast({
          title: mod.title,
          description: res?.message || 'Module session initialized.',
        });
      }
    } catch (err: any) {
      const status = err?.statusCode || err?.status;
      const msg =
        err?.message ||
        'Topic quiz admission is currently unavailable on the server.';
      if (status === 409 || msg.toLowerCase().includes('ledger') || msg.toLowerCase().includes('admission')) {
        setAdmissionNotice(
          `${mod.title}: ${msg} You can still view module leaderboards or earn points by submitting Proactive Clinical Tasks.`
        );
        toast({
          title: 'Paid quiz admission paused',
          description: 'See the notice banner above — Proactive Clinical Tasks are open for submissions.',
        });
      } else {
        toast({
          title: 'Could not start module',
          description: msg,
          variant: 'destructive',
        });
      }
    } finally {
      setStartingId(null);
    }
  };

  const handleSubmitProactiveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      toast({
        title: 'Title required',
        description: 'Enter a concise title for your clinical submission.',
        variant: 'destructive',
      });
      return;
    }

    setSubmittingTask(true);
    try {
      const res = await providerApi.submitProactiveTask({
        type: taskType,
        title: taskTitle.trim(),
        contentText: taskContent.trim(),
        contentUrl: taskUrl.trim(),
      });
      if (!res.success) {
        throw new Error(res.message || 'Submission could not be saved.');
      }
      setTaskTitle('');
      setTaskContent('');
      setTaskUrl('');
      toast({
        title: 'Clinical task submitted',
        description: res.message || 'Pending clinical admin review for rewards.',
      });
      await loadProactiveTasks();
    } catch (err: any) {
      toast({
        title: 'Submission failed',
        description: err?.message || 'Please check your details and try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmittingTask(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Aries Clinical Academy &amp; Proactive Tasks
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Continuing education topic quizzes, hospital-grade SOPs, and proactive clinical contributions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/app/gaming"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-border bg-card text-xs font-bold hover:bg-muted/50 transition-colors"
          >
            <Gamepad2 className="w-4 h-4 text-primary" />
            Aries Arena
          </Link>
          <Link
            href="/app/ai"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-border bg-card text-xs font-bold hover:bg-muted/50 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            Aries Intelligence
          </Link>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex p-1 bg-muted/60 rounded-2xl border border-border/60 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('ACADEMY')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ACADEMY'
              ? 'bg-card text-foreground shadow-sm border border-border/80'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Clinical SOPs &amp; Quizzes ({modules.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('PROACTIVE')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'PROACTIVE'
              ? 'bg-card text-foreground shadow-sm border border-border/80'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          Proactive Clinical Tasks ({proactiveTasks.length})
        </button>
      </div>

      {/* ── TAB 1: CLINICAL SOPS & TOPIC QUIZZES ── */}
      {activeTab === 'ACADEMY' && (
        <div className="space-y-4">
          {admissionNotice && (
            <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 flex items-start justify-between gap-3 text-xs text-foreground">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Quiz Admission Status</p>
                  <p className="text-muted-foreground leading-relaxed">{admissionNotice}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAdmissionNotice(null)}
                className="p-1 rounded-lg hover:bg-muted/60"
                aria-label="Dismiss notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clinical modules, protocols, specialties…"
                className="pl-10 h-10 rounded-2xl text-xs"
              />
            </div>

            {categories.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredModules.length === 0 ? (
            <div className="bg-card border border-dashed border-border/80 rounded-3xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  {modules.length === 0 ? 'No Active Training Modules Assigned' : 'No Matching Modules'}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  {modules.length === 0
                    ? 'Clinical SOP certifications and specialized rehabilitation pathways assigned by your clinical lead will appear here.'
                    : 'Try clearing your search filter to see all clinical academy modules.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredModules.map((mod) => {
                const isDone = mod.status.toLowerCase() === 'completed' || mod.status.toLowerCase() === 'certified';
                return (
                  <div
                    key={mod.id}
                    className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between gap-4 hover:border-primary/40 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">
                          {mod.category}
                        </span>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" /> {mod.duration} • {mod.lessons} Qs
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-foreground leading-snug">{mod.title}</h3>
                      {mod.description ? (
                        <p className="text-xs text-muted-foreground line-clamp-2">{mod.description}</p>
                      ) : null}

                      <div className="flex items-center gap-3 text-xs pt-1">
                        {isDone ? (
                          <span className="text-emerald-500 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Certified
                          </span>
                        ) : (
                          <span className="text-primary font-bold">Available</span>
                        )}
                        {mod.rewardCoins ? (
                          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                            +{mod.rewardCoins} Arena Coins
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void handleOpenLeaderboard(mod)}
                        className="h-9 px-3 rounded-xl text-xs font-bold"
                      >
                        <Trophy className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                        Leaderboard
                      </Button>

                      <Button
                        type="button"
                        variant={isDone ? 'outline' : 'default'}
                        size="sm"
                        disabled={startingId === mod.id}
                        onClick={() => void handleStartModule(mod)}
                        className="h-9 px-4 rounded-xl text-xs font-bold flex-1"
                      >
                        {startingId === mod.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        ) : (
                          <Play className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        {isDone ? 'Review Module' : 'Start Module'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: PROACTIVE CLINICAL TASKS ── */}
      {activeTab === 'PROACTIVE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Submission Form */}
          <form
            onSubmit={handleSubmitProactiveTask}
            className="lg:col-span-5 rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4"
          >
            <div>
              <h2 className="text-base font-extrabold text-foreground">Submit Proactive Clinical Task</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Share a clinical case summary, rehab exercise tip, or SOP contribution for admin review and Arena rewards.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="proactive-type" className="text-xs font-bold text-foreground">
                Contribution Type
              </label>
              <select
                id="proactive-type"
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-medium"
              >
                {PROACTIVE_TASK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="proactive-title" className="text-xs font-bold text-foreground">
                Title
              </label>
              <Input
                id="proactive-title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g., Post-TKR Week 3 Gait Retraining Protocol"
                className="h-10 rounded-xl text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="proactive-notes" className="text-xs font-bold text-foreground">
                Clinical Notes / Summary
              </label>
              <textarea
                id="proactive-notes"
                value={taskContent}
                onChange={(e) => setTaskContent(e.target.value)}
                placeholder="Key assessment findings, exercise dosage, precautions, and patient outcomes…"
                className="w-full min-h-28 rounded-xl border border-border bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="proactive-url" className="text-xs font-bold text-foreground">
                Reference / Video URL (optional)
              </label>
              <Input
                id="proactive-url"
                type="url"
                value={taskUrl}
                onChange={(e) => setTaskUrl(e.target.value)}
                placeholder="https://…"
                className="h-10 rounded-xl text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={submittingTask}
              className="w-full h-10 rounded-xl text-xs font-bold"
            >
              {submittingTask ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1.5" />
                  Submit for Review
                </>
              )}
            </Button>
          </form>

          {/* Past Submissions List */}
          <div className="lg:col-span-7 rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-foreground">Your Clinical Submissions</h2>
                <p className="text-xs text-muted-foreground">
                  Track review status and awarded points
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void loadProactiveTasks()}
                disabled={tasksLoading}
                className="h-8 rounded-xl text-xs"
              >
                Refresh
              </Button>
            </div>

            {tasksLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : proactiveTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-1.5">
                <p className="text-sm font-bold text-foreground">No proactive tasks submitted yet</p>
                <p className="text-xs text-muted-foreground">
                  Use the form on the left to submit your first clinical case summary or rehab guide.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {proactiveTasks.map((task: any, idx: number) => {
                  const status = String(task.status || 'pending').toLowerCase();
                  const statusBadge =
                    status === 'approved'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : status === 'rejected'
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        : 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
                  return (
                    <div
                      key={task._id || task.id || idx}
                      className="rounded-2xl border border-border/70 bg-muted/20 p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-card border border-border text-muted-foreground">
                          {String(task.type || 'task').replace(/_/g, ' ')}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${statusBadge}`}>
                          {status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-foreground">{task.title}</h3>
                      {task.contentText ? (
                        <p className="text-xs text-muted-foreground whitespace-pre-line">{task.contentText}</p>
                      ) : null}
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                        <span>
                          {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : ''}
                        </span>
                        <div className="flex items-center gap-3 font-mono font-bold">
                          {Number(task.pointsAwarded) > 0 && (
                            <span className="text-primary">+{task.pointsAwarded} pts</span>
                          )}
                          {Number(task.cashAwarded) > 0 && (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              ₹{task.cashAwarded}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {leaderboardModule && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Module Leaderboard"
        >
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  Topic Leaderboard
                </p>
                <h2 className="text-base font-extrabold text-foreground mt-0.5">
                  {leaderboardModule.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setLeaderboardModule(null)}
                className="p-1.5 rounded-xl hover:bg-muted"
                aria-label="Close leaderboard"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {leaderboardLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : leaderboardRows.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                No leaderboard scores recorded for this topic yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {leaderboardRows.map((row: any, i: number) => (
                  <div
                    key={row._id || row.userId || i}
                    className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-muted/25 border border-border/60 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-mono font-bold flex items-center justify-center">
                        {row.rank || i + 1}
                      </span>
                      <span className="font-bold text-foreground">
                        {row.alias || row.name || row.therapistName || 'Therapist'}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-primary">
                      {row.score ?? row.points ?? 0} pts
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLeaderboardModule(null)}
                className="rounded-xl text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { providerApi } from '@/services/provider-api';
import { useToast } from '@/hooks/use-toast';
import { ArenaHeader } from '@/components/gaming/arena-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClipboardCheck, Loader2, Send, TrendingUp, RefreshCw } from 'lucide-react';

const TASK_TYPES = [
  { value: 'case_study', label: 'Clinical Case Study' },
  { value: 'exercise_reel', label: 'Exercise Technique Reel' },
  { value: 'google_review', label: 'Verified Patient Google Review' },
  { value: 'video_testimonial', label: 'Patient Video Testimonial' },
  { value: 'patient_education', label: 'Patient Education Guide' },
  { value: 'clinical_sop', label: 'Doorstep SOP Insight' },
];

export default function GamingTasksDashboardPage() {
  const { toast } = useToast();
  const [coins, setCoins] = useState<number | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [type, setType] = useState('case_study');
  const [title, setTitle] = useState('');
  const [contentText, setContentText] = useState('');
  const [contentUrl, setContentUrl] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const [p, t] = await Promise.allSettled([
      providerApi.getGamingProfile(),
      providerApi.getProactiveTasks(),
    ]);
    if (p.status === 'fulfilled' && typeof p.value?.coins === 'number') {
      setCoins(p.value.coins);
    }
    if (t.status === 'fulfilled') {
      setTasks(Array.isArray(t.value) ? t.value : []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: 'Title required', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await providerApi.submitProactiveTask({
        type,
        title: title.trim(),
        contentText: contentText.trim(),
        contentUrl: contentUrl.trim(),
      });
      if (!res.success) throw new Error(res.message || 'Could not submit task.');
      setTitle('');
      setContentText('');
      setContentUrl('');
      toast({
        title: 'Proactive task submitted!',
        description: res.message || 'Pending admin verification for points and rewards.',
      });
      await load();
    } catch (err: any) {
      toast({
        title: 'Submission failed',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <ArenaHeader
        title="Task Dashboard & Proactive Submissions"
        description="Live backend workflow — submit clinical case studies, exercise reels, and verified patient reviews for Admin review."
        coins={coins}
        actions={
          <Link
            href="/app/gaming/tasks/economy"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-border bg-card text-xs font-bold hover:bg-muted/50"
          >
            <TrendingUp className="w-4 h-4 text-primary" />
            Task Economy &amp; Milestones
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            <h2 className="text-base font-extrabold text-foreground">Submit New Task</h2>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="gtask-type" className="text-xs font-bold">
              Task Category
            </label>
            <select
              id="gtask-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-medium"
            >
              {TASK_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="gtask-title" className="text-xs font-bold">
              Submission Title
            </label>
            <Input
              id="gtask-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Post-ACL Home Mobility Progression"
              required
              className="h-10 rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="gtask-notes" className="text-xs font-bold">
              Clinical Summary / Details
            </label>
            <textarea
              id="gtask-notes"
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              placeholder="Describe the protocol, patient outcome, or verification notes…"
              className="w-full min-h-28 rounded-xl border border-border bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="gtask-url" className="text-xs font-bold">
              Link / Proof URL (optional)
            </label>
            <Input
              id="gtask-url"
              type="url"
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
              placeholder="https://…"
              className="h-10 rounded-xl text-xs"
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full h-11 rounded-2xl text-xs font-bold">
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-1.5" />
                Submit for Admin Verification
              </>
            )}
          </Button>
        </form>

        <section className="lg:col-span-7 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-foreground">
              Your Submitted Tasks ({tasks.length})
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void load()}
              disabled={loading}
              className="h-8 rounded-xl text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">
              No proactive clinical tasks submitted yet. Submit your first clinical contribution on the left!
            </p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task: any, idx: number) => {
                const status = String(task.status || 'pending').toLowerCase();
                const badgeClass =
                  status === 'approved'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : status === 'rejected'
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
                return (
                  <div
                    key={task._id || task.id || idx}
                    className="rounded-2xl border border-border/70 bg-muted/20 p-4 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-card border border-border text-muted-foreground">
                        {String(task.type || 'task').replace(/_/g, ' ')}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${badgeClass}`}>
                        {status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-foreground">{task.title}</h3>
                    {task.contentText ? (
                      <p className="text-xs text-muted-foreground whitespace-pre-line">{task.contentText}</p>
                    ) : null}
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                      <span>{task.createdAt ? new Date(task.createdAt).toLocaleDateString() : ''}</span>
                      <div className="flex gap-3 font-mono font-bold">
                        {Number(task.pointsAwarded) > 0 && (
                          <span className="text-primary">+{task.pointsAwarded} pts</span>
                        )}
                        {Number(task.cashAwarded) > 0 && (
                          <span className="text-emerald-600 dark:text-emerald-400">₹{task.cashAwarded}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

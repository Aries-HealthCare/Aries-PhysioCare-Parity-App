'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { providerApi } from '@/services/provider-api';
import { ArenaHeader } from '@/components/gaming/arena-shell';
import { CheckCircle2, ChevronRight, Coins, Loader2, Star, Target, Video } from 'lucide-react';

export default function TaskEconomyPage() {
  const [coins, setCoins] = useState<number | null>(null);
  const [completedVisits, setCompletedVisits] = useState(0);
  const [referralsCount, setReferralsCount] = useState(0);
  const [approvedTasksCount, setApprovedTasksCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [p, appts, refs, tasks] = await Promise.allSettled([
      providerApi.getGamingProfile(),
      providerApi.getAppointments(),
      providerApi.fetchReferrals(),
      providerApi.getProactiveTasks(),
    ]);
    if (p.status === 'fulfilled' && typeof p.value?.coins === 'number') setCoins(p.value.coins);
    if (appts.status === 'fulfilled' && Array.isArray(appts.value)) {
      const done = appts.value.filter((a: any) => {
        const s = String(a.status || a.appointmentStatus || '').toLowerCase();
        return s.includes('complete') || s === 'done' || s === 'closed';
      }).length;
      setCompletedVisits(done);
    }
    if (refs.status === 'fulfilled' && refs.value) {
      const total =
        (Array.isArray(refs.value.referTherapist) ? refs.value.referTherapist.length : 0) +
        (Array.isArray(refs.value.referPatients) ? refs.value.referPatients.length : 0);
      setReferralsCount(total);
    }
    if (tasks.status === 'fulfilled' && Array.isArray(tasks.value)) {
      setApprovedTasksCount(
        tasks.value.filter((t: any) => String(t.status || '').toLowerCase() === 'approved').length
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const milestones = [
    {
      id: 'visits_10',
      title: 'Patient Visits Milestone (Tier 1)',
      desc: 'Complete 10 verified doorstep physiotherapy visits.',
      progress: Math.min(completedVisits, 10),
      target: 10,
      reward: 50,
    },
    {
      id: 'visits_25',
      title: 'Patient Visits Milestone (Tier 2)',
      desc: 'Complete 25 verified doorstep physiotherapy visits.',
      progress: Math.min(completedVisits, 25),
      target: 25,
      reward: 150,
    },
    {
      id: 'visits_50',
      title: 'Patient Visits Milestone (Tier 3)',
      desc: 'Complete 50 verified doorstep physiotherapy visits.',
      progress: Math.min(completedVisits, 50),
      target: 50,
      reward: 500,
    },
    {
      id: 'referrals_1',
      title: 'Patient & Colleague Referral Milestone',
      desc: 'Bring a verified referral into the Aries ecosystem.',
      progress: Math.min(referralsCount, 1),
      target: 1,
      reward: 100,
    },
    {
      id: 'proactive_3',
      title: 'Clinical Educator Contributor',
      desc: 'Have 3 proactive clinical tasks approved by the clinical team.',
      progress: Math.min(approvedTasksCount, 3),
      target: 3,
      reward: 150,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <ArenaHeader
        title="Task Economy & CRM Milestones"
        description="Live progress computed directly from your verified completed appointments, referrals, and approved clinical submissions."
        coins={coins}
        backHref="/app/gaming/tasks"
        backLabel="Back to Task Dashboard"
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-bold text-muted-foreground">Verified Completed Visits</p>
              <p className="text-3xl font-black font-mono text-primary mt-1">{completedVisits}</p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-bold text-muted-foreground">Total Referrals Logged</p>
              <p className="text-3xl font-black font-mono text-emerald-500 mt-1">{referralsCount}</p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
              <p className="text-xs font-bold text-muted-foreground">Approved Clinical Tasks</p>
              <p className="text-3xl font-black font-mono text-amber-500 mt-1">{approvedTasksCount}</p>
            </div>
          </div>

          {/* CRM Milestones */}
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              CRM-Verified Clinical Milestones
            </h2>

            <div className="space-y-3">
              {milestones.map((m) => {
                const pct = Math.round((m.progress / m.target) * 100);
                const reached = m.progress >= m.target;
                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl border border-border/70 bg-muted/20 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-extrabold text-foreground flex items-center gap-2">
                          {m.title}
                          {reached && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        </p>
                        <p className="text-xs text-muted-foreground">{m.desc}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        <Coins className="w-3.5 h-3.5" />+{m.reward} Coins
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                        <span>
                          {m.progress} / {m.target}
                        </span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            reached ? 'bg-emerald-500' : 'bg-primary'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Bonus Proof Tasks */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/app/gaming/tasks"
              className="rounded-3xl border border-border bg-card p-5 shadow-sm hover:border-primary/40 transition-all flex items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">Google Review Bonus (+30 Coins)</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Submit a verified patient Google review through Proactive Tasks for Admin credit.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-primary shrink-0" />
            </Link>

            <Link
              href="/app/gaming/tasks"
              className="rounded-3xl border border-border bg-card p-5 shadow-sm hover:border-primary/40 transition-all flex items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-500 flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">Patient Video Testimonial</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Share an approved patient recovery story URL for Admin verification &amp; rewards.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-primary shrink-0" />
            </Link>
          </section>
        </div>
      )}
    </div>
  );
}

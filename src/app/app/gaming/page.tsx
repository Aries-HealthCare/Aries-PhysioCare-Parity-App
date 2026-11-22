'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';
import { useRealtimeEvent } from '@/services/provider-realtime';
import { useToast } from '@/hooks/use-toast';
import { computeLeagueProgress, resolveArenaAvatarSrc } from '@/lib/gaming-helpers';
import {
  Trophy,
  Flame,
  Coins,
  Loader2,
  Gamepad2,
  Users,
  Swords,
  BookOpen,
  Zap,
  BriefcaseMedical,
  Grid3X3,
  Shuffle,
  Puzzle,
  LayoutGrid,
  ShoppingBag,
  UserCircle2,
  ClipboardCheck,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Crown,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArenaCardItem {
  href: string;
  title: string;
  subtitle: string;
  badge?: string;
  icon: typeof Gamepad2;
  accent: string;
}

const COMPETITION_CARDS: ArenaCardItem[] = [
  {
    href: '/app/gaming/daily-tournament',
    title: 'Daily Tournament',
    subtitle: 'Daily clinical MCQ & ordering puzzle with server leaderboard',
    badge: 'Featured',
    icon: Trophy,
    accent: 'bg-amber-500/15 text-amber-500 border-amber-500/25',
  },
  {
    href: '/app/gaming/championship',
    title: 'Championship Hub',
    subtitle: 'Daily Duels, Weekly Cup, Monthly Grand & City Leagues',
    icon: Crown,
    accent: 'bg-purple-500/15 text-purple-500 border-purple-500/25',
  },
  {
    href: '/app/gaming/head-to-head',
    title: 'Head-to-Head & Categories',
    subtitle: 'Clinical specialist & GK competition tracks',
    icon: Swords,
    accent: 'bg-rose-500/15 text-rose-500 border-rose-500/25',
  },
  {
    href: '/app/gaming/topic-quizzes',
    title: 'Topic Quizzes',
    subtitle: 'Specialty-wise physiotherapy MCQ banks & leaderboards',
    icon: BookOpen,
    accent: 'bg-sky-500/15 text-sky-500 border-sky-500/25',
  },
  {
    href: '/app/gaming/case-study',
    title: 'Case Study Arena',
    subtitle: 'Clinical differential diagnosis competition status',
    icon: BriefcaseMedical,
    accent: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25',
  },
];

const MINIGAME_CARDS: ArenaCardItem[] = [
  {
    href: '/app/gaming/rapid-fire',
    title: 'Rapid Fire Sprint',
    subtitle: '60-second clinical reflexes MCQ challenge with keyboard controls',
    badge: 'Playable',
    icon: Zap,
    accent: 'bg-orange-500/15 text-orange-500 border-orange-500/25',
  },
  {
    href: '/app/gaming/word-search',
    title: 'Anatomy Word Search',
    subtitle: 'Find hidden clinical & anatomy terms across 8×8 grids',
    badge: 'Playable',
    icon: Grid3X3,
    accent: 'bg-teal-500/15 text-teal-500 border-teal-500/25',
  },
  {
    href: '/app/gaming/word-jumble',
    title: 'Clinical Word Jumble',
    subtitle: 'Unscramble physiotherapy terminology from clinical clues',
    badge: 'Playable',
    icon: Shuffle,
    accent: 'bg-indigo-500/15 text-indigo-500 border-indigo-500/25',
  },
  {
    href: '/app/gaming/crossword',
    title: 'Physio Crossword',
    subtitle: 'Server-validated daily crossword + unrated clinical practice',
    badge: 'Playable',
    icon: Puzzle,
    accent: 'bg-cyan-500/15 text-cyan-500 border-cyan-500/25',
  },
  {
    href: '/app/gaming/block-puzzle',
    title: '8×8 Block Puzzle',
    subtitle: 'Brain-break shift puzzle with Hold slot & line combos',
    badge: 'Playable',
    icon: LayoutGrid,
    accent: 'bg-fuchsia-500/15 text-fuchsia-500 border-fuchsia-500/25',
  },
];

const ECONOMY_CARDS: ArenaCardItem[] = [
  {
    href: '/app/gaming/tasks',
    title: 'Proactive Clinical Tasks',
    subtitle: 'Submit clinical case notes, reels & SOP tips for review',
    badge: 'Live',
    icon: ClipboardCheck,
    accent: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25',
  },
  {
    href: '/app/gaming/tasks/economy',
    title: 'Task Economy & Milestones',
    subtitle: 'CRM-verified home visit milestones & referral rewards',
    icon: TrendingUp,
    accent: 'bg-blue-500/15 text-blue-500 border-blue-500/25',
  },
  {
    href: '/app/gaming/coin-shop',
    title: 'Coin Shop & Bonus Offers',
    subtitle: 'Wallet ⇄ Arena Coins packs & active bonus offers',
    icon: ShoppingBag,
    accent: 'bg-amber-500/15 text-amber-500 border-amber-500/25',
  },
  {
    href: '/app/gaming/profile',
    title: 'Arena Profile Hub',
    subtitle: 'Customize alias, avatar, league progress & achievements',
    icon: UserCircle2,
    accent: 'bg-violet-500/15 text-violet-500 border-violet-500/25',
  },
];

function ArenaCardGrid({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: ArenaCardItem[];
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base sm:text-lg font-outfit font-extrabold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-3xl border border-border/80 bg-card p-5 shadow-sm hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${item.accent}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {item.badge ? (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {item.badge}
                  </span>
                ) : null}
              </div>

              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-extrabold text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.subtitle}</p>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-primary">
                <span>Open</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default function ProviderGamingArenaPage() {
  const { user } = useProviderAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<any | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [taskCount, setTaskCount] = useState<number>(0);
  const [quizCount, setQuizCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

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
    } else {
      toast({
        title: 'Could not sync Arena profile',
        description: (profileRes.reason as any)?.message || 'Retry when back online.',
        variant: 'destructive',
      });
    }
    if (leaderboardRes.status === 'fulfilled') {
      setLeaderboard(Array.isArray(leaderboardRes.value) ? leaderboardRes.value : []);
    }
    if (quizRes.status === 'fulfilled') {
      setQuizCount(Array.isArray(quizRes.value) ? quizRes.value.length : 0);
    }
    if (taskRes.status === 'fulfilled') {
      setTaskCount(Array.isArray(taskRes.value) ? taskRes.value.length : 0);
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  useRealtimeEvent('therapist_wallet_update', () => {
    void load();
  });

  const coins = Number(profile?.coins ?? 0);
  const points = Number(profile?.points ?? profile?.xp ?? 0);
  const streakDays = Number(profile?.streakDays ?? 0);
  const alias = profile?.alias || '';
  const avatarSrc = resolveArenaAvatarSrc(profile?.avatarId, alias || user?.fullName);
  const leagueInfo = computeLeagueProgress(points);

  const myRankIndex = leaderboard.findIndex(
    (entry: any) =>
      (alias && entry.alias === alias) ||
      (profile?.userId && String(entry.userId || '') === String(profile.userId))
  );

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-400/60 bg-white/10 shrink-0 shadow-lg">
              <img src={avatarSrc} alt={alias || 'Arena avatar'} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/40 inline-flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  Aries Arena
                </span>
                <span className="text-xs font-bold text-amber-300 bg-amber-400/15 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  {leagueInfo.current.label}
                </span>
                {myRankIndex >= 0 && (
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                    Rank #{myRankIndex + 1} Today
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-outfit font-black tracking-tight">
                {alias || user?.fullName || 'Clinical Champion'}
              </h1>

              <p className="text-xs text-purple-200/80">
                {streakDays}-day streak · {points} Arena pts · {quizCount} topic quizzes · {taskCount} submitted tasks
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/app/gaming/coin-shop"
              className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl px-5 py-3 transition-colors"
            >
              <Coins className="w-6 h-6 text-amber-400" />
              <div>
                <div className="text-2xl font-black font-mono leading-none">
                  {isLoading ? '—' : coins}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-purple-200/80 font-bold mt-1">
                  Gold Coins
                </div>
              </div>
            </Link>

            <div className="flex flex-col gap-2">
              <Link
                href="/app/gaming/onboarding"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-extrabold hover:bg-amber-300 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {alias ? 'Edit Alias & Avatar' : 'Setup Arena Identity'}
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void load()}
                disabled={isLoading}
                className="h-8 text-xs text-purple-100 hover:bg-white/10 hover:text-white"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Arena
              </Button>
            </div>
          </div>
        </div>

        {/* League Progress Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 space-y-1.5 relative z-10">
          <div className="flex items-center justify-between text-[11px] text-purple-200">
            <span className="font-bold">{leagueInfo.current.label}</span>
            <span>
              {leagueInfo.next
                ? `${leagueInfo.pointsToNext} pts to ${leagueInfo.next.label}`
                : 'Highest League Achieved'}
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all"
              style={{ width: `${leagueInfo.progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Onboarding CTA if alias missing */}
      {!isLoading && !alias && (
        <div className="rounded-3xl border border-primary/30 bg-primary/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-extrabold text-foreground">Create Your Anonymous Arena Identity</p>
            <p className="text-xs text-muted-foreground">
              Choose a leaderboard alias and clinician avatar to personalize your Aries Arena profile across web and mobile.
            </p>
          </div>
          <Link
            href="/app/gaming/onboarding"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-extrabold shrink-0"
          >
            Start Arena Setup
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* 3 Clean Launchpad Sections */}
      <ArenaCardGrid
        title="Tournaments & Clinical Competitions"
        subtitle="Compete on daily leaderboards, clinical specialty quizzes, and championship leagues"
        items={COMPETITION_CARDS}
      />

      <ArenaCardGrid
        title="Interactive Clinical Mini-Games"
        subtitle="Desktop & mobile web-native games — sharpen anatomy recall or take a quick shift brain-break"
        items={MINIGAME_CARDS}
      />

      <ArenaCardGrid
        title="Tasks, Coin Economy & Profile"
        subtitle="Earn recognition through verified clinical milestones and proactive clinical contributions"
        items={ECONOMY_CARDS}
      />

      {/* Live Daily Leaderboard Preview */}
      <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h2 className="text-base font-outfit font-extrabold text-foreground">
              Today&apos;s Top Clinicians
            </h2>
          </div>
          <Link
            href="/app/gaming/championship"
            className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
          >
            Full Championship Standings
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            Loading live standings…
          </div>
        ) : leaderboard.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No tournament scores posted for today yet. Check back after the next Daily Tournament round!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {leaderboard.slice(0, 8).map((entry: any, idx: number) => {
              const isMe = alias && entry.alias === alias;
              return (
                <div
                  key={entry._id || entry.alias || idx}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                    isMe ? 'border-primary/40 bg-primary/5' : 'border-border/60 bg-muted/20'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono font-black text-muted-foreground w-6">
                      #{entry.rank ?? idx + 1}
                    </span>
                    <span className="font-extrabold text-foreground truncate">
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
      </section>
    </div>
  );
}

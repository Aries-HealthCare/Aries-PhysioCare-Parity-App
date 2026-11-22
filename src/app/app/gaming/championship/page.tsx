'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { providerApi } from '@/services/provider-api';
import { ArenaHeader, RewardsPausedNotice } from '@/components/gaming/arena-shell';
import { computeLeagueProgress, LEAGUE_TIERS } from '@/lib/gaming-helpers';
import { Crown, Flame, Loader2, MapPin, Trophy, Users, Calendar } from 'lucide-react';

const CHAMPIONSHIPS = [
  {
    id: 'daily',
    title: 'Daily Duel Masters',
    cadence: 'Every Day · 24h Window',
    entry: '10 Coins',
    prize: '100 Coins Pool',
    description: 'Head-to-head daily clinical MCQ & ordering speed challenge.',
    href: '/app/gaming/daily-tournament',
  },
  {
    id: 'weekly',
    title: 'Weekly Clinical Cup',
    cadence: 'Mon – Sun Cumulative',
    entry: '50 Coins',
    prize: '500 Coins Pool',
    description: 'Combined points across topic quizzes and daily tournament streaks.',
    href: '/app/gaming/topic-quizzes',
  },
  {
    id: 'monthly',
    title: 'Monthly Grand Championship',
    cadence: '1st – End of Month',
    entry: '200 Coins',
    prize: '2,500 Coins Pool',
    description: 'Top clinical specialists across all Aries territories compete for Grandmaster honors.',
    href: '/app/gaming/profile',
  },
  {
    id: 'city',
    title: 'City Rehabilitation League',
    cadence: 'Territory Leaderboard',
    entry: 'Free Entry',
    prize: 'Badge & Recognition',
    description: 'Compete alongside physiotherapists serving in your city & service zone.',
    href: '/app/gaming/tasks/economy',
  },
];

export default function ChampionshipHubPage() {
  const [profile, setProfile] = useState<any | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const points = Number(profile?.points ?? profile?.xp ?? 0);
  const coins = Number(profile?.coins ?? 0);
  const league = computeLeagueProgress(points);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <ArenaHeader
        title="Championship Hub & Leagues"
        description="Track Daily, Weekly, Monthly, and City clinical leagues alongside the live server leaderboard."
        coins={coins}
      />

      <RewardsPausedNotice compact />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Tournament Tracks */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CHAMPIONSHIPS.map((c) => (
              <Link
                key={c.id}
                href={c.href}
                className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      {c.cadence}
                    </span>
                    {c.id === 'city' ? (
                      <MapPin className="w-4 h-4 text-emerald-500" />
                    ) : c.id === 'monthly' ? (
                      <Crown className="w-4 h-4 text-amber-500" />
                    ) : c.id === 'weekly' ? (
                      <Calendar className="w-4 h-4 text-sky-500" />
                    ) : (
                      <Flame className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                  <h2 className="text-base font-extrabold text-foreground">{c.title}</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/60 text-[11px] font-bold">
                  <span className="text-muted-foreground">Entry: {c.entry}</span>
                  <span className="text-amber-600 dark:text-amber-400">{c.prize}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* League Tiers Overview */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                League Tiers
              </h3>
              <span className="text-xs font-bold text-primary">
                You: {league.current.label} ({points} pts)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {LEAGUE_TIERS.map((tier) => {
                const active = league.current.id === tier.id;
                return (
                  <div
                    key={tier.id}
                    className={`rounded-2xl border p-3 text-center ${
                      active ? 'border-primary bg-primary/10' : 'border-border/60 bg-muted/20'
                    }`}
                  >
                    <p className="text-xs font-extrabold text-foreground capitalize">{tier.id}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      {tier.minPoints}+ pts
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Live Daily Leaderboard */}
        <aside className="lg:col-span-5 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Live Daily Standings
            </h2>
            <span className="text-[11px] font-mono text-muted-foreground">
              {leaderboard.length} ranked
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : leaderboard.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              No leaderboard scores recorded today yet.
            </p>
          ) : (
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {leaderboard.map((row: any, idx: number) => {
                const isMe = profile?.alias && row.alias === profile.alias;
                return (
                  <div
                    key={row._id || row.alias || idx}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                      isMe ? 'border-primary/40 bg-primary/10' : 'border-border/60 bg-muted/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 font-mono font-black text-muted-foreground">
                        #{row.rank ?? idx + 1}
                      </span>
                      <span className="font-bold text-foreground truncate">
                        {row.alias || 'Anonymous'}
                        {isMe ? <span className="text-primary ml-1">(you)</span> : null}
                      </span>
                    </div>
                    <span className="font-mono font-extrabold text-primary shrink-0">
                      {row.score ?? row.points ?? 0} pts
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

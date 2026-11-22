'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { providerApi } from '@/services/provider-api';
import { useToast } from '@/hooks/use-toast';
import { ArenaHeader } from '@/components/gaming/arena-shell';
import {
  computeLeagueProgress,
  LEAGUE_TIERS,
  resolveArenaAvatarSrc,
} from '@/lib/gaming-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Award,
  Coins,
  Flame,
  Gift,
  HelpCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserCircle2,
} from 'lucide-react';

type ProfileTab = 'OVERVIEW' | 'LEAGUES' | 'MYSTERY' | 'SUPPORT';

export default function GamingProfileHubPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<ProfileTab>('OVERVIEW');
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [aliasInput, setAliasInput] = useState('');
  const [savingAlias, setSavingAlias] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = await providerApi.getGamingProfile();
      setProfile(p);
      setAliasInput(p?.alias || '');
    } catch (err: any) {
      toast({
        title: 'Could not load Arena profile',
        description: err?.message || 'Try refreshing in a moment.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSaveAlias = async (e: React.FormEvent) => {
    e.preventDefault();
    if (aliasInput.trim().length < 3) {
      toast({
        title: 'Alias too short',
        description: 'Enter at least 3 characters.',
        variant: 'destructive',
      });
      return;
    }
    setSavingAlias(true);
    try {
      const res = await providerApi.setGamingAlias(aliasInput.trim(), profile?.avatarId);
      if (!res.success) throw new Error(res.message || 'Alias could not be saved.');
      toast({ title: 'Arena alias updated' });
      await load();
    } catch (err: any) {
      toast({
        title: 'Could not update alias',
        description: err?.message || 'Try a different alias.',
        variant: 'destructive',
      });
    } finally {
      setSavingAlias(false);
    }
  };

  const handleMysteryBoxClick = () => {
    // GAME-13 compliance parity with mobile: never deduct coins or invent random rewards locally
    toast({
      title: 'Mystery Boxes Unavailable',
      description:
        'Mystery boxes are paused pending compliance & ledger verification. No coins were charged.',
    });
  };

  const points = Number(profile?.points ?? profile?.xp ?? 0);
  const coins = Number(profile?.coins ?? 0);
  const streak = Number(profile?.streakDays ?? 0);
  const league = computeLeagueProgress(points);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <ArenaHeader
        title="Arena Profile Hub"
        description="Manage your anonymous leaderboard identity, league standing, and Arena account."
        coins={coins}
        actions={
          <Link
            href="/app/gaming/onboarding"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-primary text-primary-foreground text-xs font-bold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Change Avatar
          </Link>
        }
      />

      {/* Tabs */}
      <div className="flex p-1 bg-muted/60 rounded-2xl border border-border/60 w-fit flex-wrap">
        {(
          [
            { id: 'OVERVIEW', label: 'Overview & Alias', icon: UserCircle2 },
            { id: 'LEAGUES', label: 'League Ladder', icon: Trophy },
            { id: 'MYSTERY', label: 'Mystery Boxes', icon: Gift },
            { id: 'SUPPORT', label: 'Arena Support', icon: HelpCircle },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === item.id
                  ? 'bg-card text-foreground shadow-sm border border-border/70'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {tab === 'OVERVIEW' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-4">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-primary/40 shadow-md shrink-0">
                    <img
                      src={resolveArenaAvatarSrc(profile?.avatarId, profile?.alias)}
                      alt={profile?.alias || 'Arena avatar'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      {league.current.label}
                    </span>
                    <h2 className="text-xl font-outfit font-black text-foreground">
                      {profile?.alias || 'No Alias Configured'}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {points} total points · {streak}-day active streak
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-3xl border border-border bg-card p-4 text-center">
                    <Coins className="w-5 h-5 text-amber-500 mx-auto" />
                    <p className="text-xl font-black font-mono mt-2">{coins}</p>
                    <p className="text-[11px] text-muted-foreground">Gold Coins</p>
                  </div>
                  <div className="rounded-3xl border border-border bg-card p-4 text-center">
                    <Award className="w-5 h-5 text-primary mx-auto" />
                    <p className="text-xl font-black font-mono mt-2">{points}</p>
                    <p className="text-[11px] text-muted-foreground">Arena Points</p>
                  </div>
                  <div className="rounded-3xl border border-border bg-card p-4 text-center">
                    <Flame className="w-5 h-5 text-orange-500 mx-auto" />
                    <p className="text-xl font-black font-mono mt-2">{streak}</p>
                    <p className="text-[11px] text-muted-foreground">Day Streak</p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleSaveAlias}
                className="lg:col-span-5 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4"
              >
                <div>
                  <h3 className="text-base font-extrabold text-foreground">Update Leaderboard Alias</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Synced immediately across AriesXpert Web &amp; Mobile.
                  </p>
                </div>
                <Input
                  value={aliasInput}
                  onChange={(e) => setAliasInput(e.target.value)}
                  placeholder="Enter anonymous alias"
                  maxLength={24}
                  className="h-11 rounded-2xl"
                />
                <Button type="submit" disabled={savingAlias} className="w-full h-11 rounded-2xl text-xs font-bold">
                  {savingAlias ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Alias'}
                </Button>
              </form>
            </div>
          )}

          {tab === 'LEAGUES' && (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-extrabold text-foreground">Arena League Progression</h2>
                <p className="text-xs text-muted-foreground">
                  Current standing: {league.current.label} ({points} pts)
                </p>
              </div>
              <div className="space-y-3">
                {LEAGUE_TIERS.map((tier) => {
                  const unlocked = points >= tier.minPoints;
                  const isCurrent = league.current.id === tier.id;
                  return (
                    <div
                      key={tier.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'border-primary bg-primary/10'
                          : unlocked
                            ? 'border-emerald-500/30 bg-emerald-500/5'
                            : 'border-border/60 bg-muted/20'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-extrabold text-foreground">{tier.label}</p>
                        <p className="text-xs text-muted-foreground">
                          Requires {tier.minPoints.toLocaleString()}+ points
                        </p>
                      </div>
                      <span className="text-xs font-bold">
                        {isCurrent ? 'Current League' : unlocked ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'MYSTERY' && (
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h2 className="text-base font-extrabold text-foreground">Mystery Reward Chests</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Random paid reward chests require published odds, eligibility checks, and atomic wallet ledger reconciliation. They are currently paused across mobile and web — no coins can be charged.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { name: 'Silver Clinical Chest', cost: 50 },
                  { name: 'Gold Specialist Vault', cost: 150 },
                  { name: 'Grandmaster Relic', cost: 500 },
                ].map((box) => (
                  <div
                    key={box.name}
                    className="rounded-2xl border border-border/70 bg-muted/20 p-5 text-center space-y-3"
                  >
                    <Gift className="w-8 h-8 text-amber-500 mx-auto" />
                    <div>
                      <p className="text-sm font-extrabold text-foreground">{box.name}</p>
                      <p className="text-xs text-muted-foreground">{box.cost} coins · Currently Paused</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleMysteryBoxClick}
                      className="w-full rounded-xl text-xs"
                    >
                      Check Availability
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'SUPPORT' && (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-foreground">Arena &amp; Coin Balance Support</h2>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                Need help with a leaderboard entry, proactive task review, or coin reconciliation? Raise a tracked support ticket so our Operations &amp; Clinical team can assist you directly.
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/app/support/tickets"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-bold"
                >
                  Open Support Tickets
                </Link>
                <Link
                  href="/app/support/faq"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-border text-xs font-bold hover:bg-muted/50"
                >
                  Browse Help FAQs
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

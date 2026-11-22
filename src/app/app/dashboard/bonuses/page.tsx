'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  Coins,
  Gift,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { EmptyState, ErrorState, PageSkeleton } from '@/components/ds';
import { Button } from '@/components/ui/button';
import { useBackendQuery } from '@/hooks/use-backend-query';
import { useToast } from '@/hooks/use-toast';
import { providerApi } from '@/services/provider-api';

type BonusStatus = 'earned' | 'available' | 'pending';
type BonusFilter = 'all' | BonusStatus;

interface NormalizedBonusOffer {
  id: string;
  title: string;
  description: string;
  requirement: string;
  rewardText: string;
  cashReward: number;
  pointsReward: number;
  status: BonusStatus;
  progress: number;
  icon: string;
  category: string;
  isClaimed: boolean;
}

function normalizeStatus(raw: any): BonusStatus {
  const statusStr = String(raw?.status || '').trim().toLowerCase();
  if (raw?.isClaimed === true || statusStr === 'earned' || statusStr === 'claimed' || statusStr === 'completed') {
    return 'earned';
  }
  if (statusStr === 'available' || statusStr === 'claimable' || statusStr === 'ready') {
    return 'available';
  }
  const progress = Number(raw?.progress ?? 0);
  if (Number.isFinite(progress) && progress >= 100) {
    return 'available';
  }
  return 'pending';
}

function normalizeOffer(raw: any, index: number): NormalizedBonusOffer {
  const status = normalizeStatus(raw);
  const cashReward = Number(raw?.cashReward ?? raw?.amount ?? 0) || 0;
  const pointsReward = Number(raw?.pointsReward ?? raw?.coins ?? raw?.points ?? 0) || 0;
  const rawProgress = Number(raw?.progress);
  const progress =
    status === 'earned' || status === 'available'
      ? 100
      : Number.isFinite(rawProgress)
        ? Math.min(100, Math.max(0, Math.round(rawProgress)))
        : 0;

  let rewardText = typeof raw?.reward === 'string' && raw.reward.trim() ? raw.reward.trim() : '';
  if (!rewardText) {
    const parts: string[] = [];
    if (cashReward > 0) parts.push(`₹${cashReward.toLocaleString('en-IN')}`);
    if (pointsReward > 0) parts.push(`${pointsReward.toLocaleString('en-IN')} pts`);
    rewardText = parts.length > 0 ? parts.join(' + ') : 'Bonus Reward';
  }

  return {
    id: String(raw?.id || raw?._id || `bonus-${index}`),
    title: String(raw?.title || raw?.name || 'Incentive Campaign'),
    description: String(raw?.description || 'Complete clinical milestones to unlock this therapist incentive.'),
    requirement: String(raw?.requirement || raw?.criteria || ''),
    rewardText,
    cashReward,
    pointsReward,
    status,
    progress,
    icon: String(raw?.icon || ''),
    category: String(raw?.category || ''),
    isClaimed: Boolean(raw?.isClaimed || status === 'earned'),
  };
}

function renderOfferIcon(icon: string, status: BonusStatus) {
  const trimmed = icon.trim();
  // If backend sends an emoji or short non-ASCII glyph, show it cleanly
  if (trimmed && trimmed.length <= 4 && !/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return <span className="text-lg leading-none">{trimmed}</span>;
  }
  if (status === 'earned') return <CheckCircle2 className="w-5 h-5" />;
  if (status === 'available') return <Gift className="w-5 h-5" />;
  return <Zap className="w-5 h-5" />;
}

const ACHIEVEMENT_TIERS = [
  {
    id: 'bronze',
    name: 'Bronze',
    minPoints: 0,
    perk: 'Standard bonus access',
    badgeClass: 'bg-amber-700/15 text-amber-700 dark:text-amber-400 border-amber-700/30',
  },
  {
    id: 'silver',
    name: 'Silver',
    minPoints: 300,
    perk: '+10% bonus multiplier',
    badgeClass: 'bg-slate-400/15 text-slate-700 dark:text-slate-300 border-slate-400/30',
  },
  {
    id: 'gold',
    name: 'Gold',
    minPoints: 1000,
    perk: 'Priority campaigns & top tier perks',
    badgeClass: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  },
];

export default function BonusesPage() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<BonusFilter>('all');
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const { data, error, loading, reload } = useBackendQuery(async () => {
    const [offers, gamingProfile] = await Promise.all([
      providerApi.getBonusOffers(),
      providerApi.getGamingProfile().catch(() => null),
    ]);
    return {
      offers: Array.isArray(offers) ? offers : [],
      gamingProfile,
    };
  }, []);

  const offers = useMemo(
    () => (data?.offers || []).map((item, idx) => normalizeOffer(item, idx)),
    [data?.offers]
  );

  const stats = useMemo(() => {
    let totalEarned = 0;
    let inProgressCount = 0;
    let potentialAmount = 0;
    let availableCount = 0;
    let earnedCount = 0;

    for (const o of offers) {
      if (o.status === 'earned') {
        earnedCount += 1;
        totalEarned += o.cashReward;
      } else {
        potentialAmount += o.cashReward;
        if (o.status === 'available') {
          availableCount += 1;
        } else {
          inProgressCount += 1;
        }
      }
    }

    return { totalEarned, inProgressCount, potentialAmount, availableCount, earnedCount };
  }, [offers]);

  const filteredOffers = useMemo(() => {
    if (filter === 'all') return offers;
    return offers.filter((o) => o.status === filter);
  }, [offers, filter]);

  const currentPoints = useMemo(() => {
    const profile = data?.gamingProfile;
    return Number(profile?.points ?? profile?.xp ?? profile?.coins ?? 0) || 0;
  }, [data?.gamingProfile]);

  const activeTierId = useMemo(() => {
    if (currentPoints >= 1000) return 'gold';
    if (currentPoints >= 300) return 'silver';
    return 'bronze';
  }, [currentPoints]);

  const nextTier = useMemo(() => {
    if (currentPoints < 300) return { name: 'Silver', needed: 300 - currentPoints };
    if (currentPoints < 1000) return { name: 'Gold', needed: 1000 - currentPoints };
    return null;
  }, [currentPoints]);

  const aiTip = useMemo(() => {
    if (stats.availableCount > 0) {
      return `You have ${stats.availableCount} unlocked bonus${stats.availableCount > 1 ? 'es' : ''} ready to claim right now. Claim them so payouts credit directly to your therapist account.`;
    }
    const closest = offers
      .filter((o) => o.status === 'pending')
      .sort((a, b) => b.progress - a.progress)[0];
    if (closest) {
      return `You are ${closest.progress}% of the way to "${closest.title}" (${closest.rewardText}). Completing your next few scheduled visits will unlock it fastest.`;
    }
    if (nextTier) {
      return `Earn ${nextTier.needed.toLocaleString('en-IN')} more points to reach ${nextTier.name} tier and boost your monthly campaign rewards.`;
    }
    return 'Stay consistent with on-time visits and package renewals to unlock seasonal therapist bonus campaigns.';
  }, [offers, stats.availableCount, nextTier]);

  const handleClaim = async (offer: NormalizedBonusOffer) => {
    setClaimingId(offer.id);
    try {
      const res = await providerApi.claimBonus(offer.id);
      if (!res.success) {
        throw new Error(res.message || 'Unable to claim this bonus right now.');
      }
      toast({
        title: 'Bonus claimed!',
        description: res.message || `${offer.title} (${offer.rewardText}) has been added to your rewards.`,
      });
      await reload();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Claim failed',
        description: err?.message || 'Could not claim this bonus. Please try again.',
      });
    } finally {
      setClaimingId(null);
    }
  };

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const filterChips: Array<{ key: BonusFilter; label: string; count: number }> = [
    { key: 'all', label: 'All', count: offers.length },
    { key: 'available', label: 'Available', count: stats.availableCount },
    { key: 'pending', label: 'In Progress', count: stats.inProgressCount },
    { key: 'earned', label: 'Earned', count: stats.earnedCount },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Breadcrumb + Header */}
      <div className="space-y-3">
        <Link
          href="/app"
          prefetch={false}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-outfit font-bold uppercase tracking-[0.18em] text-primary">
              Therapist Incentives
            </p>
            <h1 className="font-outfit text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Bonuses &amp; Incentive Campaigns
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track active performance bonuses, claim unlocked rewards, and climb achievement tiers.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={() => void reload()}
              className="h-10 px-4 rounded-2xl text-xs font-bold gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </Button>
            <Link href="/app/gaming" prefetch={false}>
              <Button className="h-10 px-4 rounded-2xl text-xs font-bold gap-2">
                <Trophy className="w-3.5 h-3.5" />
                <span>Rewards Hub</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4-Card Responsive KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Earned
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="font-outfit text-2xl sm:text-3xl font-black mt-2 tabular-nums text-emerald-600">
            ₹{stats.totalEarned.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.earnedCount} campaign{stats.earnedCount === 1 ? '' : 's'} claimed
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              In Progress
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="font-outfit text-2xl sm:text-3xl font-black mt-2 tabular-nums">
            {stats.inProgressCount}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Active milestones underway</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Potential Bonus
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="font-outfit text-2xl sm:text-3xl font-black mt-2 tabular-nums">
            ₹{stats.potentialAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Remaining cash pool</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Available to Claim
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <p className="font-outfit text-2xl sm:text-3xl font-black mt-2 tabular-nums text-indigo-600">
            {stats.availableCount}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Ready for instant claim</p>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {filterChips.map((chip) => {
          const active = filter === chip.key;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => setFilter(chip.key)}
              className={`min-h-[40px] px-4 py-2 rounded-2xl text-xs font-bold border transition-all inline-flex items-center gap-2 ${
                active
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
              }`}
            >
              <span>{chip.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  active ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                }`}
              >
                {chip.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bonus Offer Cards */}
      {filteredOffers.length === 0 ? (
        <EmptyState
          title={offers.length === 0 ? 'No active bonus campaigns' : 'No bonuses in this category'}
          description={
            offers.length === 0
              ? 'New incentive campaigns will appear here automatically as they become available for your city.'
              : 'Try switching to another filter to view your other active or completed bonus campaigns.'
          }
          actionLabel={filter !== 'all' ? 'Show All Campaigns' : undefined}
          onAction={filter !== 'all' ? () => setFilter('all') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOffers.map((offer) => {
            const isClaiming = claimingId === offer.id;
            const statusTone =
              offer.status === 'earned'
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25'
                : offer.status === 'available'
                  ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25';

            const statusLabel =
              offer.status === 'earned'
                ? 'Earned'
                : offer.status === 'available'
                  ? 'Available'
                  : 'In Progress';

            const iconBg =
              offer.status === 'earned'
                ? 'bg-emerald-500/10 text-emerald-600'
                : offer.status === 'available'
                  ? 'bg-indigo-500/10 text-indigo-600'
                  : 'bg-primary/10 text-primary';

            return (
              <div
                key={offer.id}
                className={`rounded-3xl border bg-card p-5 shadow-sm flex flex-col justify-between gap-4 transition-all ${
                  offer.status === 'available'
                    ? 'border-indigo-500/40 ring-1 ring-indigo-500/15'
                    : 'border-border/80'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
                        {renderOfferIcon(offer.icon, offer.status)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-extrabold text-foreground leading-snug line-clamp-2">
                          {offer.title}
                        </h3>
                        {offer.category ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {offer.category}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide shrink-0 ${statusTone}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{offer.description}</p>

                  {offer.requirement ? (
                    <div className="rounded-2xl bg-muted/40 border border-border/60 px-3 py-2 text-xs text-foreground">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                        Requirement
                      </span>
                      <span className="font-medium">{offer.requirement}</span>
                    </div>
                  ) : null}

                  {/* Reward Banner */}
                  <div className="flex items-center justify-between gap-2 rounded-2xl bg-primary/5 border border-primary/15 px-3.5 py-2.5">
                    <span className="text-[11px] font-bold text-muted-foreground">Reward</span>
                    <span className="text-sm font-extrabold font-mono text-primary">{offer.rewardText}</span>
                  </div>

                  {/* Progress Bar for non-earned offers */}
                  {offer.status !== 'earned' ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-muted-foreground">Milestone progress</span>
                        <span className="font-mono font-bold text-foreground">{offer.progress}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            offer.status === 'available' ? 'bg-indigo-500' : 'bg-primary'
                          }`}
                          style={{ width: `${offer.progress}%` }}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Action Footer */}
                <div className="pt-1">
                  {offer.status === 'available' ? (
                    <Button
                      type="button"
                      onClick={() => void handleClaim(offer)}
                      disabled={isClaiming}
                      className="w-full h-11 rounded-2xl font-extrabold text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                    >
                      {isClaiming ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Claiming Bonus…</span>
                        </>
                      ) : (
                        <>
                          <Gift className="w-4 h-4" />
                          <span>Claim Bonus</span>
                        </>
                      )}
                    </Button>
                  ) : offer.status === 'earned' ? (
                    <div className="w-full h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Bonus Claimed</span>
                    </div>
                  ) : (
                    <div className="w-full h-10 rounded-2xl bg-muted/50 border border-border/60 text-muted-foreground text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Complete milestone to unlock</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Achievement Tiers + AI Incentive Tip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Achievement Tiers */}
        <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-foreground">Achievement Tiers</h2>
                <p className="text-xs text-muted-foreground">
                  Unlock higher campaign multipliers as your points grow
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-primary/10 border border-primary/20 text-xs font-extrabold text-primary self-start sm:self-auto">
              <Trophy className="w-3.5 h-3.5" />
              <span className="font-mono">{currentPoints.toLocaleString('en-IN')} pts</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ACHIEVEMENT_TIERS.map((tier) => {
              const isActive = tier.id === activeTierId;
              const unlocked = currentPoints >= tier.minPoints;
              return (
                <div
                  key={tier.id}
                  className={`rounded-2xl border p-4 space-y-2 transition-all ${
                    isActive
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : unlocked
                        ? 'border-border bg-card'
                        : 'border-border/60 bg-muted/20 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tier.badgeClass}`}
                    >
                      {tier.name}
                    </span>
                    {isActive ? (
                      <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    ) : unlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : null}
                  </div>
                  <p className="text-sm font-extrabold font-mono text-foreground">
                    {tier.minPoints.toLocaleString('en-IN')}+ pts
                  </p>
                  <p className="text-xs text-muted-foreground">{tier.perk}</p>
                </div>
              );
            })}
          </div>

          {nextTier ? (
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">{nextTier.needed.toLocaleString('en-IN')} pts</strong> away from{' '}
              <strong className="text-primary">{nextTier.name}</strong> tier.
            </p>
          ) : (
            <p className="text-xs text-emerald-600 font-semibold">
              You have reached the top Gold tier — enjoy full campaign bonus eligibility!
            </p>
          )}
        </div>

        {/* AI Incentive Tip */}
        <div className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/5 via-card to-card p-5 sm:p-6 shadow-sm flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-foreground">AI Incentive Tip</h2>
                <p className="text-[11px] text-muted-foreground">Personalized payout guidance</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{aiTip}</p>
          </div>
          <Link href="/app/dashboard/targets" prefetch={false} className="block">
            <Button variant="outline" className="w-full h-10 rounded-2xl text-xs font-bold border-primary/30 text-primary hover:bg-primary/10">
              Review Monthly Target →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

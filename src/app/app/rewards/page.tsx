'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';
import { useRealtimeEvent } from '@/services/provider-realtime';
import {
  Award,
  Star,
  ShieldCheck,
  Sparkles,
  Trophy,
  Loader2,
  AlertTriangle,
  Gift,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Clinical tier & rewards.
 *
 * Tier progression is computed from the provider's real completed-visit count
 * (`/api/app/home/fetchNoOfVisit`), badges come from the therapist record
 * (`therapistProfile.badges` — the same list the mobile profile renders), and the
 * claimable rewards are the live bonus offers from `/api/app/gaming/bonus-offers`.
 */

const TIERS = [
  { name: 'Silver Practitioner', min: 0, next: 'Gold Specialist', target: 25 },
  { name: 'Gold Specialist', min: 25, next: 'Platinum Healer', target: 75 },
  { name: 'Platinum Healer', min: 75, next: 'Diamond Master', target: 150 },
  { name: 'Diamond Master', min: 150, next: 'Apex Legend', target: 300 },
  { name: 'Apex Legend', min: 300, next: null, target: 300 },
];

function resolveTier(completed: number) {
  const index = TIERS.reduce((acc, tier, i) => (completed >= tier.min ? i : acc), 0);
  return TIERS[index];
}

export default function ProviderRewardsPage() {
  const { user } = useProviderAuth();

  const [completedVisits, setCompletedVisits] = useState<number | null>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const [statsRes, offersRes] = await Promise.allSettled([
      providerApi.getDashboardStats(),
      providerApi.getBonusOffers(),
    ]);

    if (statsRes.status === 'fulfilled') {
      const stats = statsRes.value;
      setCompletedVisits(stats.detailedVisits?.year?.completed ?? stats.totalVisits ?? 0);
    }
    if (offersRes.status === 'fulfilled') {
      setOffers(offersRes.value);
    }
    if (statsRes.status === 'rejected' && offersRes.status === 'rejected') {
      setError('Could not load your rewards data from the server.');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // A wallet credit or a completed payment can move you up a tier — reload on both.
  useRealtimeEvent(['therapist_wallet_update', 'payment_success'], () => {
    void load();
  });

  const handleClaim = async (offerId: string) => {
    setClaimingId(offerId);
    setClaimMessage(null);
    try {
      const res = await providerApi.claimBonus(offerId);
      setClaimMessage(res.message || (res.success ? 'Bonus claimed.' : 'Could not claim this bonus.'));
      if (res.success) await load();
    } catch (err: any) {
      setClaimMessage(err?.message || 'Could not claim this bonus.');
    } finally {
      setClaimingId(null);
    }
  };

  const completed = completedVisits ?? 0;
  const tier = resolveTier(completed);
  const remaining = Math.max(0, tier.target - completed);
  const span = Math.max(1, tier.target - tier.min);
  const progressPercent = Math.min(100, Math.max(0, Math.round(((completed - tier.min) / span) * 100)));

  const badges = user?.badges || [];
  const rating = user?.rating ?? 0;

  const scoreCards = [
    { label: 'Quality Score', value: user?.qaScoreAverage, suffix: '', icon: ShieldCheck },
    { label: 'Opportunity Score', value: user?.therapistOpportunityScore, suffix: '', icon: TrendingUp },
    { label: 'City Rank', value: user?.cityRankPercentile, suffix: 'th pct', icon: Trophy },
    { label: 'Happiness Index', value: user?.therapistHappinessScore, suffix: '', icon: Sparkles },
  ].filter((card) => card.value !== undefined && card.value !== null);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Clinical Tier &amp; Rewards</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Higher tiers earn top broadcast routing priority and commission bonuses.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold rounded-2xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Tier card */}
      <div className="bg-gradient-to-br from-amber-500/10 via-card to-card border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-500">Current Level</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">{tier.name} Tier</h2>
              <div className="text-xs text-muted-foreground mt-0.5">
                {isLoading && completedVisits === null ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading visit history…
                  </span>
                ) : (
                  <>
                    {rating ? `${rating} rating • ` : ''}
                    {completed} completed visits this year
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            {tier.next ? (
              <>
                <div className="text-xs font-bold text-foreground">Next: {tier.next}</div>
                <div className="text-[11px] text-muted-foreground font-mono">
                  {remaining} more session{remaining === 1 ? '' : 's'} needed
                </div>
              </>
            ) : (
              <div className="text-xs font-bold text-amber-500">Top tier reached</div>
            )}
          </div>
        </div>

        <div className="space-y-1 pt-2">
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
            <span>{tier.min} sessions</span>
            <span>{tier.target} sessions</span>
          </div>
        </div>
      </div>

      {/* Performance scores from the therapist record */}
      {scoreCards.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {scoreCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground text-[11px] font-bold">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{card.label}</span>
                </div>
                <div className="text-xl font-extrabold text-foreground mt-1">
                  {Number(card.value).toFixed(card.suffix ? 0 : 1)}
                  <span className="text-xs text-muted-foreground font-bold ml-1">{card.suffix}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Badges from the provider record */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-foreground">Earned Clinical Badges</h3>

        {badges.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No badges awarded yet. Badges are granted by clinical governance as you complete milestones.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {badges.map((badge, idx) => (
              <div
                key={`${badge}-${idx}`}
                className="p-4 rounded-2xl border border-border/80 bg-muted/20 flex flex-col justify-between text-center space-y-2"
              >
                <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center text-amber-500 bg-amber-500/10">
                  <Star className="w-5 h-5" />
                </div>
                <div className="text-xs font-extrabold text-foreground">{badge}</div>
                <div className="text-[10px] font-bold text-emerald-500">✓ Unlocked</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live bonus offers */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary" />
            <span>Available Bonuses</span>
          </h3>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>

        {claimMessage && (
          <div className="p-3 bg-muted/30 rounded-2xl text-xs font-bold text-foreground">{claimMessage}</div>
        )}

        {offers.length === 0 && !isLoading ? (
          <p className="text-xs text-muted-foreground italic">
            No bonus offers are live for your region right now.
          </p>
        ) : (
          <div className="space-y-3">
            {offers.map((offer: any, index: number) => {
              const id = offer._id || offer.id || String(index);
              const claimed = offer.claimed === true || offer.isClaimed === true;
              return (
                <div
                  key={id}
                  className="p-4 rounded-2xl border border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-extrabold text-foreground">{offer.title || offer.name || 'Bonus offer'}</div>
                    <p className="text-muted-foreground mt-0.5">{offer.description || offer.subtitle}</p>
                    {(offer.rewardCoins || offer.rewardAmount) && (
                      <div className="text-[11px] font-bold text-emerald-500 mt-1">
                        Reward:{' '}
                        {offer.rewardCoins ? `${offer.rewardCoins} coins` : `₹${offer.rewardAmount}`}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => handleClaim(id)}
                    disabled={claimed || claimingId === id}
                    className="h-9 px-4 rounded-xl text-xs font-bold shrink-0"
                  >
                    {claimingId === id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : claimed ? (
                      'Claimed'
                    ) : (
                      'Claim'
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

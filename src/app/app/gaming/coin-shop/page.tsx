'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { providerApi } from '@/services/provider-api';
import { useToast } from '@/hooks/use-toast';
import { ArenaHeader, RewardsPausedNotice } from '@/components/gaming/arena-shell';
import { isRewardsPausedError } from '@/lib/gaming-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRightLeft, Coins, Gift, Loader2, Sparkles } from 'lucide-react';

const COIN_PACKS = [
  { id: 'small', title: 'Small Bag', coins: 50, price: 50, badge: 'Starter' },
  { id: 'sack', title: 'Sack of Gold', coins: 100, price: 100, badge: 'Popular' },
  { id: 'chest', title: 'Chest of Gold', coins: 250, price: 250, badge: 'Best Value' },
  { id: 'treasure', title: 'Treasure Chest', coins: 500, price: 500, badge: '+5% Bonus' },
  { id: 'vault', title: 'Vault of Wealth', coins: 1000, price: 1000, badge: '+10% Bonus' },
  { id: 'mountain', title: 'Mountain of Gold', coins: 2500, price: 2500, badge: '+15% Bonus' },
  { id: 'emperor', title: "Emperor's Hoard", coins: 5000, price: 5000, badge: '+25% Bonus' },
];

export default function CoinShopPage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any | null>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pausedMessage, setPausedMessage] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [p, b] = await Promise.allSettled([
      providerApi.getGamingProfile(),
      providerApi.getBonusOffers(),
    ]);
    if (p.status === 'fulfilled') setProfile(p.value);
    if (b.status === 'fulfilled') setOffers(Array.isArray(b.value) ? b.value : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const runTransfer = async (direction: 'buy' | 'withdraw', amount: number, label: string) => {
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({ title: 'Enter a positive coin amount', variant: 'destructive' });
      return;
    }
    setBusyAction(label);
    try {
      const res =
        direction === 'buy'
          ? await providerApi.buyCoinsFromWallet(amount)
          : await providerApi.withdrawCoinsToWallet(amount);
      if (!res.success) throw new Error(res.message || 'Transfer was declined.');
      toast({
        title: direction === 'buy' ? `Added ${amount} coins` : `Withdrew ${amount} coins to wallet`,
        description: res.message || 'Balances updated.',
      });
      setCustomAmount('');
      await load();
    } catch (err: any) {
      if (isRewardsPausedError(err)) {
        setPausedMessage(err?.message);
        toast({
          title: 'Coin transfers temporarily paused',
          description: err?.message || 'Wallet and coin balances were not changed.',
        });
      } else {
        toast({
          title: 'Transfer failed',
          description: err?.message || 'Could not complete coin transfer.',
          variant: 'destructive',
        });
      }
    } finally {
      setBusyAction(null);
    }
  };

  const handleClaimOffer = async (offerId: string, title: string) => {
    setBusyAction(offerId);
    try {
      const res = await providerApi.claimBonus(offerId);
      if (!res.success) throw new Error(res.message || 'Offer could not be claimed.');
      toast({ title: `Claimed: ${title}`, description: res.message });
      await load();
    } catch (err: any) {
      if (isRewardsPausedError(err)) {
        setPausedMessage(err?.message);
        toast({
          title: 'Bonus claims temporarily paused',
          description: err?.message || 'Try again once security maintenance completes.',
        });
      } else {
        toast({
          title: 'Claim failed',
          description: err?.message || 'Offer could not be claimed.',
          variant: 'destructive',
        });
      }
    } finally {
      setBusyAction(null);
    }
  };

  const coins = Number(profile?.coins ?? 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <ArenaHeader
        title="Arena Coin Shop & Bonus Offers"
        description="Convert between your IMPS payout wallet and Arena Gold Coins or claim active therapist bonuses."
        coins={coins}
      />

      {pausedMessage ? <RewardsPausedNotice message={pausedMessage} /> : null}

      {/* Custom Wallet <-> Coins Transfer */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        <div className="lg:col-span-6 space-y-1">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-primary" />
            Direct Wallet ⇄ Coins Conversion
          </h2>
          <p className="text-xs text-muted-foreground">
            Settled server-side so your web workstation and mobile app always show the exact same balance.
          </p>
        </div>

        <div className="lg:col-span-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <Input
            type="number"
            min={1}
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Coins / ₹ amount"
            className="h-11 rounded-2xl font-mono"
          />
          <Button
            type="button"
            disabled={busyAction !== null}
            onClick={() => void runTransfer('buy', parseInt(customAmount, 10), 'custom-buy')}
            className="h-11 rounded-2xl text-xs font-bold shrink-0"
          >
            {busyAction === 'custom-buy' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buy Coins'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busyAction !== null}
            onClick={() => void runTransfer('withdraw', parseInt(customAmount, 10), 'custom-withdraw')}
            className="h-11 rounded-2xl text-xs font-bold shrink-0"
          >
            {busyAction === 'custom-withdraw' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Withdraw'}
          </Button>
        </div>
      </section>

      {/* Coin Packs */}
      <section className="space-y-3">
        <h2 className="text-base font-outfit font-extrabold text-foreground">Standard Coin Packs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COIN_PACKS.map((pack) => (
            <div
              key={pack.id}
              className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    {pack.badge}
                  </span>
                  <Coins className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="text-base font-extrabold text-foreground">{pack.title}</h3>
                <p className="text-2xl font-black font-mono text-primary">{pack.coins.toLocaleString()} Coins</p>
              </div>

              <Button
                type="button"
                disabled={busyAction !== null}
                onClick={() => void runTransfer('buy', pack.price, pack.id)}
                className="w-full h-10 rounded-xl text-xs font-bold"
              >
                {busyAction === pack.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  `Get for ₹${pack.price.toLocaleString()}`
                )}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Active Bonus Offers from Backend */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary" />
            Active Arena Bonus Offers
          </h2>
          <Sparkles className="w-4 h-4 text-amber-500" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : offers.length === 0 ? (
          <p className="text-xs text-muted-foreground">No active bonus offers at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {offers.map((offer: any, idx: number) => {
              const id = String(offer._id || offer.id || idx);
              const title = offer.title || offer.name || 'Clinical Bonus Offer';
              return (
                <div
                  key={id}
                  className="p-4 rounded-2xl border border-border/70 bg-muted/20 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground">
                      {offer.description || `Reward: ${offer.rewardCoins || offer.coins || 0} coins`}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={busyAction !== null}
                    onClick={() => void handleClaimOffer(id, title)}
                    className="rounded-xl text-xs font-bold shrink-0"
                  >
                    {busyAction === id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Claim'}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

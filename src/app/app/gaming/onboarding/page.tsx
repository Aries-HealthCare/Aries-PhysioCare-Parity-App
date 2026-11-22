'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { providerApi } from '@/services/provider-api';
import { useToast } from '@/hooks/use-toast';
import { ArenaHeader } from '@/components/gaming/arena-shell';
import { AVATAR_CATALOG, resolveArenaAvatarSrc } from '@/lib/gaming-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Loader2, Sparkles } from 'lucide-react';

export default function GamingOnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [alias, setAlias] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('avatar_d1');
  const [category, setCategory] = useState<'doctor' | 'male' | 'female'>('doctor');
  const [saving, setSaving] = useState(false);
  const [coins, setCoins] = useState<number | null>(null);

  useEffect(() => {
    providerApi
      .getGamingProfile()
      .then((profile) => {
        if (profile?.alias) setAlias(String(profile.alias));
        if (profile?.avatarId) setSelectedAvatar(String(profile.avatarId));
        if (typeof profile?.coins === 'number') setCoins(profile.coins);
      })
      .catch(() => {
        // Fresh Arena user
      });
  }, []);

  const filteredAvatars = AVATAR_CATALOG.filter((a) => a.category === category);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = alias.trim();
    if (clean.length < 3 || clean.length > 24) {
      toast({
        title: 'Invalid alias length',
        description: 'Choose an alias between 3 and 24 characters.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const res = await providerApi.setGamingAlias(clean, selectedAvatar);
      if (!res.success) {
        throw new Error(res.message || 'Could not save your Arena alias.');
      }
      toast({
        title: 'Arena identity saved!',
        description: `Welcome to Aries Arena as @${clean}.`,
      });
      router.push('/app/gaming');
    } catch (err: any) {
      toast({
        title: 'Alias update failed',
        description: err?.message || 'Try a different anonymous alias (must not match your real name).',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <ArenaHeader
        title="Arena Identity & Avatar Setup"
        description="Pick an anonymous leaderboard alias and clinician avatar synced with AriesXpert Mobile."
        coins={coins}
      />

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Live Preview & Alias Input */}
        <div className="lg:col-span-5 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-primary/40 shadow-xl bg-muted/30">
              <img
                src={resolveArenaAvatarSrc(selectedAvatar, alias)}
                alt="Selected avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-lg font-outfit font-black text-foreground">
                {alias.trim() || '@YourAlias'}
              </p>
              <p className="text-xs text-muted-foreground">
                Shown publicly on Daily &amp; Championship Leaderboards
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="arena-alias" className="text-xs font-bold text-foreground">
              Anonymous Arena Alias
            </label>
            <Input
              id="arena-alias"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="e.g., SpineNinja, OrthoAce, RehabPro"
              maxLength={24}
              required
              className="h-11 rounded-2xl text-sm"
            />
            <p className="text-[11px] text-muted-foreground">
              3–24 characters. For leaderboard privacy, avoid using your real full name.
            </p>
          </div>

          <Button type="submit" disabled={saving} className="w-full h-11 rounded-2xl text-xs font-extrabold">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Saving Identity…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-1.5" />
                Save &amp; Enter Arena
              </>
            )}
          </Button>
        </div>

        {/* Right: Avatar Gallery */}
        <div className="lg:col-span-7 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-foreground">Choose Your Clinician Avatar</h2>
              <p className="text-xs text-muted-foreground">36 official Aries Arena portraits</p>
            </div>
            <div className="flex p-1 bg-muted/60 rounded-2xl border border-border/60">
              {(
                [
                  { id: 'doctor', label: 'Specialists' },
                  { id: 'male', label: 'Male' },
                  { id: 'female', label: 'Female' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    category === cat.id
                      ? 'bg-card text-foreground shadow-sm border border-border/70'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {filteredAvatars.map((av) => {
              const selected = selectedAvatar === av.id;
              return (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedAvatar(av.id)}
                  className={`relative rounded-2xl overflow-hidden border-2 p-1.5 transition-all bg-muted/20 ${
                    selected
                      ? 'border-primary ring-2 ring-primary/30 scale-[1.02]'
                      : 'border-border/60 hover:border-primary/40'
                  }`}
                >
                  <img
                    src={av.src}
                    alt={av.label}
                    className="w-full aspect-square object-cover rounded-xl"
                  />
                  {selected && (
                    <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </div>
  );
}

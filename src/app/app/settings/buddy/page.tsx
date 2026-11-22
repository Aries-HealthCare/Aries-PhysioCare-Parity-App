'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bot, Heart, Loader2, Plus, Save, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageSkeleton } from '@/components/ds';
import { providerApi } from '@/services/provider-api';
import { useToast } from '@/hooks/use-toast';

const RELATIONSHIP_STYLES = ['Caring Friend', 'Strict Coach', 'Clinical Mentor', 'Calm Strategist'];
const APPRECIATION_STYLES = ['Good Morning Messages', 'Milestone Celebrations', 'End-of-Day Reflection', 'Weekly Encouragement'];

interface FamilyMember {
  name: string;
  relation: string;
}

export default function BuddySettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [aiCustomName, setAiCustomName] = useState('');
  const [relationshipType, setRelationshipType] = useState('Caring Friend');
  const [incomeGoal, setIncomeGoal] = useState('50000');
  const [preferredWorkingHours, setPreferredWorkingHours] = useState('09:00 - 18:00');

  const [enableAriesBuddy, setEnableAriesBuddy] = useState(true);
  const [enableMotivationalMessages, setEnableMotivationalMessages] = useState(true);
  const [enableEarningsCoaching, setEnableEarningsCoaching] = useState(true);
  const [enableArenaNotifications, setEnableArenaNotifications] = useState(true);
  const [enableMoodCheckIns, setEnableMoodCheckIns] = useState(true);
  const [enableAppointmentReminders, setEnableAppointmentReminders] = useState(true);
  const [enablePaymentReminders, setEnablePaymentReminders] = useState(true);
  const [enablePushNotifications, setEnablePushNotifications] = useState(true);

  const [rememberFamily, setRememberFamily] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [newFamName, setNewFamName] = useState('');
  const [newFamRelation, setNewFamRelation] = useState('');
  const [partnerAppreciationEnabled, setPartnerAppreciationEnabled] = useState(false);
  const [partnerAppreciationType, setPartnerAppreciationType] = useState(APPRECIATION_STYLES[0]);

  useEffect(() => {
    let cancelled = false;
    providerApi
      .getBuddyProfile()
      .then((profile) => {
        if (cancelled || !profile) return;
        const p = profile.profile || profile;
        const s = p.settings || {};
        const g = p.userGoals || p.goals || {};
        setEnableAriesBuddy(s.enableAriesBuddy ?? true);
        setEnableMotivationalMessages(s.enableMotivationalMessages ?? true);
        setEnableEarningsCoaching(s.enableEarningsCoaching ?? true);
        setEnableArenaNotifications(s.enableArenaNotifications ?? true);
        setEnableMoodCheckIns(s.enableMoodCheckIns ?? true);
        setEnableAppointmentReminders(s.enableAppointmentReminders ?? true);
        setEnablePaymentReminders(s.enablePaymentReminders ?? true);
        setEnablePushNotifications(s.enablePushNotifications ?? true);
        setIncomeGoal(String(g.incomeGoal ?? 50000));
        setPreferredWorkingHours(g.preferredWorkingHours || '09:00 - 18:00');
        setAiCustomName(p.aiCustomName || '');
        setRelationshipType(p.relationshipType || 'Caring Friend');
        setRememberFamily(!!p.rememberFamily);
        setFamilyMembers(
          Array.isArray(p.familyMembers)
            ? p.familyMembers.map((m: any) => ({ name: String(m?.name || ''), relation: String(m?.relation || '') }))
            : []
        );
        setPartnerAppreciationEnabled(!!p.partnerAppreciationEnabled);
        setPartnerAppreciationType(p.partnerAppreciationType || APPRECIATION_STYLES[0]);
      })
      .catch(() => {
        /* defaults remain editable */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddFamily = () => {
    if (!newFamName.trim()) return;
    setFamilyMembers((prev) => [...prev, { name: newFamName.trim(), relation: newFamRelation.trim() || 'Family' }]);
    setNewFamName('');
    setNewFamRelation('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await providerApi.saveBuddyProfile({
        settings: {
          enableAriesBuddy,
          enableMotivationalMessages,
          enableEarningsCoaching,
          enableArenaNotifications,
          enableMoodCheckIns,
          enableAppointmentReminders,
          enablePaymentReminders,
          enablePushNotifications,
        },
        goals: {
          incomeGoal: Number(incomeGoal) || 50000,
          preferredWorkingHours: preferredWorkingHours.trim() || '09:00 - 18:00',
        },
        aiCustomName: aiCustomName.trim(),
        relationshipType,
        rememberFamily,
        familyMembers,
        partnerAppreciationEnabled,
        partnerAppreciationType,
      });
      if (!res.success) throw new Error(res.message || 'Could not save Buddy preferences.');
      toast({ title: 'Buddy settings saved', description: 'Your AI clinical companion profile has been updated.' });
    } catch (err: any) {
      toast({
        title: 'Save failed',
        description: err?.message || 'Unable to update Buddy preferences.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageSkeleton rows={4} />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/app/settings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Settings</span>
          </Link>
          <h1 className="text-2xl font-outfit font-extrabold tracking-tight">Aries Buddy Settings</h1>
          <p className="text-xs text-muted-foreground">
            Personalize your AI coach persona, income coaching goals, proactive reminders, and family check-ins.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="h-10 rounded-2xl text-xs font-bold gap-1.5">
          <Link href="/app/buddy">
            <Bot className="w-4 h-4 text-primary" /> Open Buddy Copilot
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-outfit font-extrabold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Companion Persona &amp; Goals</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Custom Companion Name</Label>
              <Input
                value={aiCustomName}
                onChange={(e) => setAiCustomName(e.target.value)}
                placeholder="e.g. Tanya, Rivan, Coach Aries"
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Coaching Style</Label>
              <div className="flex flex-wrap gap-2">
                {RELATIONSHIP_STYLES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setRelationshipType(style)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                      relationshipType === style
                        ? 'bg-primary text-white border-primary'
                        : 'bg-background text-muted-foreground border-border'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Monthly Income Goal (₹)</Label>
              <Input
                type="number"
                min={5000}
                value={incomeGoal}
                onChange={(e) => setIncomeGoal(e.target.value)}
                className="h-10 rounded-xl font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Preferred Working Hours</Label>
              <Input
                value={preferredWorkingHours}
                onChange={(e) => setPreferredWorkingHours(e.target.value)}
                placeholder="09:00 - 18:00"
                className="h-10 rounded-xl font-mono"
              />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-outfit font-extrabold flex items-center gap-2 mb-1">
            <Bot className="w-4 h-4 text-primary" />
            <span>Coaching &amp; Proactive Nudges</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Enable Aries Buddy', desc: 'Intelligent coach & clinical copilot.', v: enableAriesBuddy, s: setEnableAriesBuddy },
              { label: 'Motivational Messages', desc: 'Daily encouragement and clinical tips.', v: enableMotivationalMessages, s: setEnableMotivationalMessages },
              { label: 'Earnings Coaching', desc: 'Pushes to hit monthly income milestones.', v: enableEarningsCoaching, s: setEnableEarningsCoaching },
              { label: 'Arena Notifications', desc: 'Daily quiz & tournament nudges.', v: enableArenaNotifications, s: setEnableArenaNotifications },
              { label: 'Mood Check-Ins', desc: 'Quick daily wellbeing prompts.', v: enableMoodCheckIns, s: setEnableMoodCheckIns },
              { label: 'Appointment Reminders', desc: 'Upcoming visit prep alerts.', v: enableAppointmentReminders, s: setEnableAppointmentReminders },
              { label: 'Payment Reminders', desc: 'Pending collection & payout alerts.', v: enablePaymentReminders, s: setEnablePaymentReminders },
              { label: 'System Coach Alerts', desc: 'Deliver coach hints as notifications.', v: enablePushNotifications, s: setEnablePushNotifications },
            ].map((item) => (
              <label key={item.label} className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-muted/25 cursor-pointer">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={item.v}
                  onChange={(e) => item.s(e.target.checked)}
                  className="h-4 w-4 rounded text-primary shrink-0"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-outfit font-extrabold flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Personal Milestones &amp; Appreciation</span>
          </h2>

          <label className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-muted/25 cursor-pointer">
            <div>
              <p className="text-xs font-bold">Remember Family &amp; Life Events</p>
              <p className="text-[11px] text-muted-foreground">Allow Buddy to remember loved ones for warm milestone greetings.</p>
            </div>
            <input
              type="checkbox"
              checked={rememberFamily}
              onChange={(e) => setRememberFamily(e.target.checked)}
              className="h-4 w-4 rounded text-primary"
            />
          </label>

          {rememberFamily && (
            <div className="space-y-3 pl-1">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={newFamName}
                  onChange={(e) => setNewFamName(e.target.value)}
                  placeholder="Name"
                  className="h-9 rounded-xl text-xs"
                />
                <Input
                  value={newFamRelation}
                  onChange={(e) => setNewFamRelation(e.target.value)}
                  placeholder="Relation (e.g. Spouse, Parent)"
                  className="h-9 rounded-xl text-xs"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddFamily} className="h-9 rounded-xl text-xs font-bold shrink-0">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>
              {familyMembers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {familyMembers.map((m, idx) => (
                    <span
                      key={`${m.name}-${idx}`}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-xs font-semibold"
                    >
                      {m.name} ({m.relation})
                      <button
                        type="button"
                        onClick={() => setFamilyMembers((prev) => prev.filter((_, i) => i !== idx))}
                        aria-label={`Remove ${m.name}`}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <label className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-muted/25 cursor-pointer">
            <div>
              <p className="text-xs font-bold">Daily Appreciation Nudges</p>
              <p className="text-[11px] text-muted-foreground">Receive personalized encouragement matched to your style.</p>
            </div>
            <input
              type="checkbox"
              checked={partnerAppreciationEnabled}
              onChange={(e) => setPartnerAppreciationEnabled(e.target.checked)}
              className="h-4 w-4 rounded text-primary"
            />
          </label>

          {partnerAppreciationEnabled && (
            <div className="flex flex-wrap gap-2">
              {APPRECIATION_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setPartnerAppreciationType(style)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                    partnerAppreciationType === style
                      ? 'bg-primary text-white border-primary'
                      : 'bg-background text-muted-foreground border-border'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          )}
        </section>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="h-11 px-8 rounded-2xl text-xs font-extrabold gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving Buddy Settings…' : 'Save Buddy Settings'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

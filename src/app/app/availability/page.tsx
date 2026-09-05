'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';
import {
  Clock,
  MapPin,
  CheckCircle2,
  Plus,
  Save,
  Loader2,
  AlertTriangle,
  Radio,
  Bike,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Availability & service coverage.
 *
 * There is no weekly shift table in the platform — what actually governs which visits
 * reach a provider is the service-area record (`areaOfServiceInfo`) plus the duty flag,
 * exactly as the mobile onboarding/profile screens capture it:
 *   POST /api/app/expert/isTherapistActive        — accepting leads or not
 *   POST /api/app/expert/addAreaOfServiceInfo     — pincodes, radius, commute, travel window
 * The values shown are read back from the provider record so both apps agree.
 */

const COMMUTE_TYPES = ['Two Wheeler', 'Four Wheeler', 'Public Transport', 'Walk'];
const TRAVEL_WINDOWS = ['Anytime', 'Morning', 'Afternoon', 'Evening', 'Night'];

interface AvailabilityForm {
  city: string;
  serviceAreas: string[];
  targetPincodes: string[];
  serviceRadius: number;
  maxDistance: number;
  commuteType: string;
  travelCapacity: string;
  travelTimePreference: string;
  urgentVisits: boolean;
}

export default function ProviderAvailabilityPage() {
  const { user, dutyStatus, toggleDutyStatus, refreshProfile } = useProviderAuth();

  const [form, setForm] = useState<AvailabilityForm | null>(null);
  const [newPincode, setNewPincode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const availability = await providerApi.getAvailability();
      setForm({
        city: availability.city,
        serviceAreas: availability.serviceAreas,
        targetPincodes: availability.targetPincodes,
        serviceRadius: availability.serviceRadius,
        maxDistance: availability.maxDistance,
        commuteType: availability.commuteType,
        travelCapacity: availability.travelCapacity,
        travelTimePreference: availability.travelTimePreference,
        urgentVisits: availability.urgentVisits,
      });
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Could not load your service coverage from the server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const set = <K extends keyof AvailabilityForm>(key: K, value: AvailabilityForm[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleAddPincode = () => {
    if (!form) return;
    if (newPincode.length === 6 && !form.targetPincodes.includes(newPincode)) {
      set('targetPincodes', [...form.targetPincodes, newPincode]);
      setNewPincode('');
    }
  };

  const handleSave = async () => {
    if (!form) return;
    setIsSaving(true);
    setError(null);
    setSavedSuccess(false);
    try {
      // The endpoint is multipart because the onboarding step can carry a driving
      // licence upload; scalar fields are sent the same way the mobile wizard sends them.
      const formData = new FormData();
      formData.append('user', user?._id || '');
      formData.append('city', form.city);
      formData.append('serviceAreas', JSON.stringify(form.serviceAreas));
      formData.append('targetPincodes', JSON.stringify(form.targetPincodes));
      formData.append('serviceRadius', String(form.serviceRadius));
      formData.append('maxDistance', String(form.maxDistance));
      formData.append('commuteType', form.commuteType);
      formData.append('travelCapacity', form.travelCapacity);
      formData.append('travelTimePreference', form.travelTimePreference);
      formData.append('urgentVisits', String(form.urgentVisits));

      const res = await providerApi.addAreaOfServiceInfo(formData);
      if (!res.success) {
        setError(res.message || 'Your service coverage could not be saved.');
        return;
      }
      await refreshProfile();
      await load();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      setError(err?.message || 'Your service coverage could not be saved.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Availability &amp; Service Coverage</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Where and how far you travel, and whether you are currently accepting broadcasts.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving || !form}
          className="h-10 px-5 rounded-xl bg-primary text-white font-bold text-xs shadow-md flex items-center gap-1.5"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Saving…' : 'Save Coverage'}</span>
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Service coverage saved to your provider record.</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
          <button type="button" onClick={() => load()} className="ml-auto underline">
            Retry
          </button>
        </div>
      )}

      {/* Duty status — the switch that actually gates incoming broadcasts */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary" />
            <span>Accepting Lead Broadcasts</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            While off duty the dispatcher routes patient broadcasts to other providers in your area.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleDutyStatus}
          className={`px-5 py-2 rounded-2xl text-xs font-extrabold border transition-all shrink-0 ${
            dutyStatus
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
              : 'bg-muted text-muted-foreground border-border'
          }`}
        >
          {dutyStatus ? '🟢 On Duty' : '⚪ Off Duty'}
        </button>
      </div>

      {isLoading || !form ? (
        <div className="bg-card border border-border/80 rounded-3xl p-8 shadow-sm text-center">
          <Loader2 className="w-6 h-6 text-muted-foreground mx-auto mb-2 animate-spin" />
          <p className="text-xs font-bold text-foreground">Loading your service coverage…</p>
        </div>
      ) : (
        <>
          {/* Pincode coverage */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Doorstep Service Pincodes</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                You only receive doorstep visit broadcasts from patients inside these pincodes.
              </p>
            </div>

            <div className="flex gap-2 max-w-md">
              <Input
                placeholder="Add 6-digit pincode (e.g. 400058)"
                maxLength={6}
                value={newPincode}
                onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, ''))}
                className="h-11 rounded-xl font-mono text-xs"
              />
              <Button onClick={handleAddPincode} className="h-11 px-5 rounded-xl font-bold text-xs">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {form.targetPincodes.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No pincodes configured — you will not receive doorstep broadcasts.
                </p>
              ) : (
                form.targetPincodes.map((code) => (
                  <div
                    key={code}
                    className="px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold flex items-center gap-2"
                  >
                    <span>{code}</span>
                    <button
                      type="button"
                      onClick={() =>
                        set('targetPincodes', form.targetPincodes.filter((p) => p !== code))
                      }
                      className="text-muted-foreground hover:text-destructive"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            {form.serviceAreas.length > 0 && (
              <div className="pt-2 border-t border-border/60">
                <p className="text-[11px] font-bold text-muted-foreground mb-1.5">Named service areas</p>
                <div className="flex flex-wrap gap-2">
                  {form.serviceAreas.map((area) => (
                    <span
                      key={area}
                      className="px-3 py-1 rounded-xl bg-muted/40 border border-border/60 text-xs font-bold text-foreground"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Travel preferences */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
              <Bike className="w-4 h-4 text-primary" />
              <span>Travel &amp; Commute</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <label className="p-3.5 bg-muted/20 rounded-2xl block">
                <span className="font-bold text-foreground block mb-1.5">Base city</span>
                <Input
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </label>

              <label className="p-3.5 bg-muted/20 rounded-2xl block">
                <span className="font-bold text-foreground block mb-1.5">Commute type</span>
                <select
                  value={form.commuteType}
                  onChange={(e) => set('commuteType', e.target.value)}
                  className="w-full h-10 px-3 bg-background border border-input rounded-xl text-xs font-bold"
                >
                  <option value="">Not set</option>
                  {COMMUTE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="p-3.5 bg-muted/20 rounded-2xl block">
                <span className="font-bold text-foreground block mb-1.5">
                  Service radius: {form.serviceRadius} km
                </span>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={form.serviceRadius}
                  onChange={(e) => set('serviceRadius', Number(e.target.value))}
                  className="w-full"
                />
              </label>

              <label className="p-3.5 bg-muted/20 rounded-2xl block">
                <span className="font-bold text-foreground block mb-1.5">
                  Max travel distance: {form.maxDistance} km
                </span>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={form.maxDistance}
                  onChange={(e) => set('maxDistance', Number(e.target.value))}
                  className="w-full"
                />
              </label>

              <label className="p-3.5 bg-muted/20 rounded-2xl block">
                <span className="font-bold text-foreground block mb-1.5">Preferred travel window</span>
                <select
                  value={form.travelTimePreference}
                  onChange={(e) => set('travelTimePreference', e.target.value)}
                  className="w-full h-10 px-3 bg-background border border-input rounded-xl text-xs font-bold"
                >
                  {TRAVEL_WINDOWS.map((window) => (
                    <option key={window} value={window}>
                      {window}
                    </option>
                  ))}
                </select>
              </label>

              <div className="p-3.5 bg-muted/20 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-foreground">Accept urgent visits</div>
                  <div className="text-muted-foreground">Same-day emergency dispatch requests.</div>
                </div>
                <input
                  type="checkbox"
                  checked={form.urgentVisits}
                  onChange={(e) => set('urgentVisits', e.target.checked)}
                  className="h-4 w-4 rounded text-primary"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

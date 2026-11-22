'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Car,
  Clock,
  Loader2,
  MapPin,
  Plus,
  Save,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';
import { useToast } from '@/hooks/use-toast';

export default function EditServiceAreaPage() {
  const { user, refreshProfile } = useProviderAuth();
  const { toast } = useToast();

  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [newArea, setNewArea] = useState('');
  const [targetPincodes, setTargetPincodes] = useState<string[]>([]);
  const [newPin, setNewPin] = useState('');
  const [serviceRadius, setServiceRadius] = useState(10);
  const [commuteType, setCommuteType] = useState('Two-Wheeler');
  const [travelCapacity, setTravelCapacity] = useState('3-5 visits/day');
  const [travelTimePreference, setTravelTimePreference] = useState('Anytime');
  const [urgentVisits, setUrgentVisits] = useState(true);
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const areaInfo = user.areaOfServiceInfo;
    setCity(areaInfo?.city || user.city || '');
    setPincode(areaInfo?.pincode || user.zipCode || '');
    setServiceAreas(areaInfo?.serviceAreas || user.serviceAreas || []);
    setTargetPincodes(areaInfo?.targetPincodes || user.targetPincodes || user.servicePincodes || []);
    setServiceRadius(Number(areaInfo?.serviceRadius) || 10);
    setCommuteType(areaInfo?.commuteType || 'Two-Wheeler');
    setTravelCapacity(areaInfo?.travelCapacity || '3-5 visits/day');
    setTravelTimePreference(areaInfo?.travelTimePreference || 'Anytime');
    setUrgentVisits(areaInfo?.urgentVisits ?? true);
    setDrivingLicenseNumber(areaInfo?.drivingLicenseNumber || user.drivingLicenseNumber || '');
  }, [user]);

  const addArea = () => {
    const clean = newArea.trim();
    if (!clean || serviceAreas.includes(clean)) return;
    setServiceAreas((prev) => [...prev, clean]);
    setNewArea('');
  };

  const addPincode = () => {
    const clean = newPin.replace(/\D/g, '').slice(0, 10);
    if (clean.length < 4 || targetPincodes.includes(clean)) return;
    setTargetPincodes((prev) => [...prev, clean]);
    setNewPin('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) {
      toast({ title: 'City required', description: 'Please specify your primary clinical city.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      const userId = user?._id || user?.id || '';
      if (userId) fd.append('user', userId);
      fd.append('city', city.trim());
      fd.append('pincode', pincode.trim());
      fd.append('serviceAreas', JSON.stringify(serviceAreas));
      fd.append('targetPincodes', JSON.stringify(targetPincodes));
      fd.append('serviceRadius', String(serviceRadius));
      fd.append('maxDistance', String(serviceRadius));
      fd.append('commuteType', commuteType);
      fd.append('travelCapacity', travelCapacity);
      fd.append('travelTimePreference', travelTimePreference);
      fd.append('urgentVisits', String(urgentVisits));
      if (drivingLicenseNumber.trim()) {
        fd.append('drivingLicenseNumber', drivingLicenseNumber.trim().toUpperCase());
      }

      const res = await providerApi.addAreaOfServiceInfo(fd);
      if (res && res.success === false) {
        throw new Error(res.message || 'Could not update service area.');
      }
      await refreshProfile();
      toast({ title: 'Service area saved', description: 'Lead matching will use your updated territory immediately.' });
    } catch (err: any) {
      toast({
        title: 'Save failed',
        description: err?.message || 'Could not save your service area settings.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/app/profile"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Profile</span>
          </Link>
          <h1 className="text-2xl font-outfit font-extrabold tracking-tight">Service Territory &amp; Commute</h1>
          <p className="text-xs text-muted-foreground">
            Control the cities, neighborhoods, pincodes, and travel radius used to match doorstep patient leads.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="h-10 rounded-2xl text-xs font-bold">
          <Link href="/app/availability">Duty &amp; Availability Hub</Link>
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-5">
          <h2 className="text-sm font-outfit font-extrabold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span>Coverage Territory</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Primary City *</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Mumbai" className="h-10 rounded-xl" required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Base Pincode</Label>
              <Input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="e.g. 400092" className="h-10 rounded-xl font-mono" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold">Maximum Travel Radius</Label>
              <span className="text-xs font-mono font-extrabold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                {serviceRadius} km
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={40}
              step={1}
              value={serviceRadius}
              onChange={(e) => setServiceRadius(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>2 km (Local)</span>
              <span>15 km (City Zone)</span>
              <span>40 km (Metro)</span>
            </div>
          </div>

          {/* Neighborhoods */}
          <div className="space-y-2">
            <Label className="text-xs font-bold">Preferred Neighborhoods / Localities</Label>
            <div className="flex gap-2">
              <Input
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addArea();
                  }
                }}
                placeholder="Add locality (e.g. Bandra West, Indiranagar)"
                className="h-10 rounded-xl"
              />
              <Button type="button" variant="outline" onClick={addArea} className="h-10 rounded-xl px-4 text-xs font-bold">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            {serviceAreas.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {serviceAreas.map((area) => (
                  <span
                    key={area}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20"
                  >
                    {area}
                    <button
                      type="button"
                      onClick={() => setServiceAreas((prev) => prev.filter((a) => a !== area))}
                      aria-label={`Remove ${area}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Target Pincodes */}
          <div className="space-y-2">
            <Label className="text-xs font-bold">Target Service Pincodes</Label>
            <div className="flex gap-2">
              <Input
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addPincode();
                  }
                }}
                placeholder="Enter 6-digit pincode"
                className="h-10 rounded-xl font-mono"
              />
              <Button type="button" variant="outline" onClick={addPincode} className="h-10 rounded-xl px-4 text-xs font-bold">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            {targetPincodes.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {targetPincodes.map((pin) => (
                  <span
                    key={pin}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-foreground text-xs font-mono font-bold border border-border"
                  >
                    {pin}
                    <button
                      type="button"
                      onClick={() => setTargetPincodes((prev) => prev.filter((p) => p !== pin))}
                      aria-label={`Remove pincode ${pin}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-outfit font-extrabold flex items-center gap-2">
            <Car className="w-4 h-4 text-primary" />
            <span>Commute &amp; Visit Preferences</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Primary Commute Mode</Label>
              <select
                value={commuteType}
                onChange={(e) => setCommuteType(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold"
              >
                <option value="Two-Wheeler">Two-Wheeler / Scooter</option>
                <option value="Four-Wheeler">Car / Four-Wheeler</option>
                <option value="Public Transport">Public Transport / Metro</option>
                <option value="Cab / Rideshare">Cab / Rideshare</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Daily Visit Capacity</Label>
              <select
                value={travelCapacity}
                onChange={(e) => setTravelCapacity(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold"
              >
                <option value="1-2 visits/day">1–2 visits / day</option>
                <option value="3-5 visits/day">3–5 visits / day</option>
                <option value="6-8 visits/day">6–8 visits / day</option>
                <option value="8+ visits/day">8+ visits / day</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Preferred Time Window
              </Label>
              <select
                value={travelTimePreference}
                onChange={(e) => setTravelTimePreference(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold"
              >
                <option value="Anytime">Anytime (Flexible)</option>
                <option value="Morning (7 AM - 12 PM)">Morning (7 AM – 12 PM)</option>
                <option value="Afternoon (12 PM - 5 PM)">Afternoon (12 PM – 5 PM)</option>
                <option value="Evening (5 PM - 9 PM)">Evening (5 PM – 9 PM)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Driving License No. (Optional)</Label>
              <Input
                value={drivingLicenseNumber}
                onChange={(e) => setDrivingLicenseNumber(e.target.value.toUpperCase())}
                placeholder="e.g. MH0220210012345"
                className="h-10 rounded-xl font-mono uppercase"
              />
            </div>
          </div>

          <label className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/60 cursor-pointer">
            <div className="flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">Accept Same-Day Urgent Doorstep Visits</p>
                <p className="text-[11px] text-muted-foreground">
                  Receive priority broadcasts for high-urgency post-op and acute pain patients nearby.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={urgentVisits}
              onChange={(e) => setUrgentVisits(e.target.checked)}
              className="h-4 w-4 rounded text-primary"
            />
          </label>
        </section>

        <div className="flex justify-end gap-3">
          <Button asChild type="button" variant="outline" className="h-11 rounded-2xl text-xs font-bold">
            <Link href="/app/profile">Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving} className="h-11 px-8 rounded-2xl text-xs font-extrabold gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving Territory…' : 'Save Service Area'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}

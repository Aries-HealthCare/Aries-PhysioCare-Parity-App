'use client';

import React, { useState } from 'react';
import { useProviderAuth } from '@/services/provider-auth-context';
import {
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ProviderAvailabilityPage() {
  const { user, updateUserData } = useProviderAuth();

  const [pincodes, setPincodes] = useState<string[]>(
    user?.servicePincodes && user.servicePincodes.length > 0
      ? user.servicePincodes
      : ['400091', '400092', '400067', '400068', '400053']
  );
  const [newPincode, setNewPincode] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [schedule, setSchedule] = useState<Record<string, { morning: boolean; afternoon: boolean; evening: boolean }>>({
    Monday: { morning: true, afternoon: true, evening: true },
    Tuesday: { morning: true, afternoon: true, evening: true },
    Wednesday: { morning: true, afternoon: true, evening: true },
    Thursday: { morning: true, afternoon: true, evening: true },
    Friday: { morning: true, afternoon: true, evening: true },
    Saturday: { morning: true, afternoon: true, evening: false },
    Sunday: { morning: false, afternoon: false, evening: false },
  });

  const handleToggleSlot = (day: string, slot: 'morning' | 'afternoon' | 'evening') => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        [slot]: !schedule[day][slot],
      },
    });
  };

  const handleAddPincode = () => {
    if (newPincode && newPincode.length === 6 && !pincodes.includes(newPincode)) {
      setPincodes([...pincodes, newPincode]);
      setNewPincode('');
    }
  };

  const handleRemovePincode = (code: string) => {
    setPincodes(pincodes.filter((p) => p !== code));
  };

  const handleSave = () => {
    updateUserData({ servicePincodes: pincodes });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
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
            <h1 className="text-2xl font-extrabold tracking-tight">Availability & Service Coverage</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Configure your weekly appointment shifts and doorstep service pincodes.
          </p>
        </div>

        <Button onClick={handleSave} className="h-10 px-5 rounded-xl bg-primary text-white font-bold text-xs shadow-md flex items-center gap-1.5">
          <Save className="w-4 h-4" />
          <span>Save Availability</span>
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Availability schedule updated successfully.</span>
        </div>
      )}

      {/* Pincodes Coverage Section */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span>Active Doorstep Service Pincodes</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            You will only receive doorstep visit broadcasts from patients located inside these pincodes.
          </p>
        </div>

        <div className="flex gap-2 max-w-md">
          <Input
            placeholder="Add 6-digit Pincode (e.g. 400058)"
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
          {pincodes.map((code) => (
            <div
              key={code}
              className="px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-mono font-bold flex items-center gap-2"
            >
              <span>{code}</span>
              <button
                type="button"
                onClick={() => handleRemovePincode(code)}
                className="text-muted-foreground hover:text-destructive"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Shift Matrix */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Weekly Shift Schedule</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Toggle your availability for morning (8 AM - 12 PM), afternoon (12 PM - 4 PM), and evening (4 PM - 9 PM) sessions.
          </p>
        </div>

        <div className="space-y-2">
          {DAYS.map((day) => {
            const current = schedule[day];
            return (
              <div
                key={day}
                className="p-3.5 rounded-2xl border border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <span className="font-bold text-foreground w-28">{day}</span>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleToggleSlot(day, 'morning')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      current.morning
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Morning (8-12)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleSlot(day, 'afternoon')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      current.afternoon
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Afternoon (12-4)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleSlot(day, 'evening')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      current.evening
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Evening (4-9)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

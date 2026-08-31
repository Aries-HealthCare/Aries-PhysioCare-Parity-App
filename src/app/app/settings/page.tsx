'use client';

import React, { useState } from 'react';
import { useProviderAuth } from '@/services/provider-auth-context';
import {
  Settings,
  Bell,
  Lock,
  Moon,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Save,
  LogOut,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/theme-toggle';

export default function ProviderSettingsPage() {
  const { user, logout } = useProviderAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [language, setLanguage] = useState('English');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Application Settings</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Configure notification channels, audio alerts, and app security preferences.
          </p>
        </div>

        <Button onClick={handleSave} className="h-10 px-5 rounded-xl bg-primary text-white font-bold text-xs shadow-md">
          <Save className="w-4 h-4 mr-1.5" />
          <span>Save Preferences</span>
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {/* Notifications Section */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <span>Alerts & Notifications</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3.5 bg-muted/20 rounded-2xl">
            <div>
              <div className="font-bold text-foreground">Lead Broadcast Alerts</div>
              <div className="text-muted-foreground">Receive high-priority sound & push notifications for nearby patient matches.</div>
            </div>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="h-4 w-4 rounded text-primary"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-muted/20 rounded-2xl">
            <div>
              <div className="font-bold text-foreground">WhatsApp Visit Dispatches</div>
              <div className="text-muted-foreground">Receive daily schedule briefs and urgent booking alerts on WhatsApp.</div>
            </div>
            <input
              type="checkbox"
              checked={whatsappAlerts}
              onChange={(e) => setWhatsappAlerts(e.target.checked)}
              className="h-4 w-4 rounded text-primary"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-muted/20 rounded-2xl">
            <div>
              <div className="font-bold text-foreground">Loud Sound for High-Urgency Leads</div>
              <div className="text-muted-foreground">Play audible chime when a new lead broadcast matches your territory.</div>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="h-4 w-4 rounded text-primary"
            />
          </div>
        </div>
      </div>

      {/* Appearance & Language */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <span>Appearance & Language</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-muted/20 rounded-2xl flex items-center justify-between">
            <div>
              <div className="font-bold text-foreground">Theme Mode</div>
              <div className="text-muted-foreground">Switch between light and dark medical theme.</div>
            </div>
            <ThemeToggle />
          </div>

          <div className="p-3.5 bg-muted/20 rounded-2xl flex items-center justify-between">
            <div>
              <div className="font-bold text-foreground">App Language</div>
              <div className="text-muted-foreground">Select preferred interface language.</div>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1.5 bg-background border border-input rounded-xl text-xs font-bold"
            >
              <option value="English">English</option>
              <option value="Hindi">हिंदी (Hindi)</option>
              <option value="Marathi">मराठी (Marathi)</option>
              <option value="Gujarati">ગુજરાતી (Gujarati)</option>
            </select>
          </div>
        </div>
      </div>

      {/* System Status & Logout */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Aries Core Web Engine v2.4.0 (PWA Enabled)</span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-destructive font-bold hover:underline flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

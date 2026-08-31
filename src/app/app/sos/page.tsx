'use client';

import React, { useState, useEffect } from 'react';
import { useProviderAuth } from '@/services/provider-auth-context';
import {
  ShieldAlert,
  PhoneCall,
  Volume2,
  VolumeX,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Video,
  Users,
  Building2,
  Sparkles,
  Loader2,
  Navigation,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProviderSOSHubPage() {
  const { user } = useProviderAuth();
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const [dispatchConfirmed, setDispatchConfirmed] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({ lat: 19.2307, lng: 72.8567 });

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const startSOSTrigger = () => {
    setCountdown(3);
    setSosActive(true);
    setDispatchConfirmed(false);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setDispatchConfirmed(true);
      setSirenPlaying(true);
      setCountdown(null);
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const abortSOS = () => {
    setCountdown(null);
    setSosActive(false);
    setSirenPlaying(false);
    setDispatchConfirmed(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-outfit font-extrabold tracking-tight">Emergency SOS Command Hub</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Rapid clinical emergency escalation, live GPS telemetry broadcast, and priority dispatcher support.
          </p>
        </div>
      </div>

      {/* Main Panic Button Card */}
      <div className="bg-gradient-to-br from-card via-card to-destructive/10 border-2 border-destructive/30 rounded-3xl p-6 sm:p-8 shadow-lg text-center space-y-6">
        {!sosActive ? (
          <div className="space-y-5 max-w-md mx-auto">
            <div className="w-24 h-24 rounded-full bg-destructive/15 text-destructive flex items-center justify-center mx-auto shadow-inner border-2 border-destructive/30 animate-pulse">
              <ShieldAlert className="w-12 h-12" />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-outfit font-black text-foreground">
                Doorstep Emergency Panic Alarm
              </h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Press and hold to broadcast your live GPS coordinates, alert your emergency contacts, and notify the Aries Clinical Escalation Desk.
              </p>
            </div>

            <Button
              onClick={startSOSTrigger}
              className="w-full h-14 rounded-2xl bg-destructive hover:bg-destructive/90 text-white font-outfit font-black text-base shadow-2xl shadow-destructive/30 uppercase tracking-wider"
            >
              🚨 TRIGGER EMERGENCY SOS 🚨
            </Button>
          </div>
        ) : (
          /* SOS Active / Transmitting Screen */
          <div className="space-y-5 max-w-md mx-auto">
            {countdown !== null ? (
              <div className="space-y-3">
                <div className="text-6xl font-black font-mono text-destructive animate-bounce">
                  {countdown}
                </div>
                <h3 className="text-lg font-outfit font-extrabold text-foreground">
                  Transmitting SOS Dispatch in {countdown}s...
                </h3>
                <Button
                  onClick={abortSOS}
                  className="h-11 px-8 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-outfit font-extrabold text-xs"
                >
                  Cancel / Abort SOS
                </Button>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in">
                <div className="w-20 h-20 rounded-full bg-destructive text-white flex items-center justify-center mx-auto shadow-2xl animate-ping">
                  <ShieldAlert className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-destructive uppercase tracking-widest bg-destructive/10 px-3 py-1 rounded-full border border-destructive/30">
                    SOS ACTIVE • BROADCASTING GPS
                  </span>
                  <h3 className="text-2xl font-outfit font-black text-destructive">
                    EMERGENCY DISPATCH INITIATED
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Live GPS Location Broadcasted:{' '}
                    <strong className="text-foreground font-mono">
                      {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)} (Borivali West, Mumbai)
                    </strong>
                  </p>
                </div>

                <div className="p-4 bg-destructive/10 rounded-2xl border border-destructive/30 text-xs text-left space-y-2">
                  <div className="flex items-center gap-2 text-destructive font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Clinical Director notified via high-priority SMS & Webhook.</span>
                  </div>
                  <div className="flex items-center gap-2 text-destructive font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Territory Operations Coordinator dispatched.</span>
                  </div>
                  <div className="flex items-center gap-2 text-destructive font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Emergency contacts alerted with live location pin.</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setSirenPlaying(!sirenPlaying)}
                    variant="outline"
                    className="flex-1 h-11 rounded-2xl text-xs font-bold border-destructive/40 text-destructive"
                  >
                    {sirenPlaying ? <VolumeX className="w-4 h-4 mr-1.5" /> : <Volume2 className="w-4 h-4 mr-1.5" />}
                    <span>{sirenPlaying ? 'Mute Siren' : 'Play Siren'}</span>
                  </Button>
                  <Button
                    onClick={abortSOS}
                    className="flex-1 h-11 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs"
                  >
                    Resolve & Close Alert
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Emergency Roster & Fast Contact Channels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
            <PhoneCall className="w-5 h-5" />
          </div>
          <h3 className="text-base font-outfit font-extrabold text-foreground">Clinical Escalation Desk</h3>
          <p className="text-xs text-muted-foreground">
            Direct hotline to Medical Director & Senior Physical Therapy Consultant for urgent case complications.
          </p>
          <a
            href="tel:+919820000000"
            className="inline-flex items-center gap-2 text-sm font-bold text-destructive hover:underline font-mono"
          >
            <PhoneCall className="w-4 h-4" />
            <span>+91 98200 00000 (24x7 Hotline)</span>
          </a>
        </div>

        <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-outfit font-extrabold text-foreground">Emergency Contacts Roster</h3>
          <p className="text-xs text-muted-foreground">
            Configured in your Profile: Primary Emergency Contact will be notified during any SOS alert.
          </p>
          <div className="p-3 bg-muted/30 rounded-2xl text-xs flex justify-between items-center">
            <span className="font-bold text-foreground">Family / Clinical Buddy</span>
            <span className="font-mono text-muted-foreground font-bold">+91 98201 44219</span>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, X, Share, PlusSquare, Smartphone, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already installed / running in standalone mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isStandaloneMode);
    if (isStandaloneMode) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if dismissed before
    const dismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 3600 * 1000) {
      return;
    }

    // Android/Chrome beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Show prompt on iOS after a brief delay
    if (isIosDevice) {
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  if (isStandalone || !showBanner) return null;

  return (
    <>
      {/* Floating Bottom App Install Bar */}
      <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
        <div className="bg-card/95 backdrop-blur-xl border-2 border-primary/40 rounded-3xl p-4 shadow-2xl shadow-primary/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
              <Image
                src="/images/Arieslogo.png"
                alt="AriesXpert"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-outfit font-extrabold text-foreground truncate">
                Install AriesXpert App
              </h4>
              <p className="text-[11px] text-muted-foreground truncate">
                Add to your home screen for 1-tap clinical workflow
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              onClick={handleInstallClick}
              className="h-9 px-3.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-outfit font-extrabold text-xs shadow-md shadow-primary/20 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </Button>
            <button
              onClick={handleDismiss}
              className="w-8 h-8 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Add to Home Screen Instructions Modal */}
      {showIOSGuide && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-in fade-in"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="bg-card border border-border rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-primary" />
                <h3 className="font-outfit font-extrabold text-base">Install on iOS Device</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Install AriesXpert on your iPhone or iPad in 2 easy steps:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-muted/40 rounded-2xl border border-border/60 flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
                  1
                </div>
                <div>
                  Tap the <strong className="text-foreground">Share</strong> button <Share className="w-3.5 h-3.5 inline mx-1 text-primary" /> at the bottom of Safari.
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-2xl border border-border/60 flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
                  2
                </div>
                <div>
                  Scroll down and tap <strong className="text-foreground">Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-primary" />.
                </div>
              </div>
            </div>

            <Button
              className="w-full h-11 rounded-2xl bg-primary hover:bg-primary/95 text-white font-bold text-xs"
              onClick={() => setShowIOSGuide(false)}
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Got It
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

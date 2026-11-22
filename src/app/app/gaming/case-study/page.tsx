'use client';

import React from 'react';
import Link from 'next/link';
import { ArenaHeader } from '@/components/gaming/arena-shell';
import { ClipboardCheck, ShieldCheck, Sparkles } from 'lucide-react';

/**
 * Mirrors mobile `CaseStudyArenaPage` (GAME-10 production containment):
 * Never charges entry fees, simulates opponents, or computes unverified diagnosis
 * payouts locally until the backend ships a clinically reviewed case catalog.
 */
export default function CaseStudyArenaPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ArenaHeader
        title="Clinical Case Study Arena"
        description="Server-verified clinical differential diagnosis competitions."
      />

      <div className="rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-sm text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <h2 className="text-xl font-outfit font-black text-foreground">
            Clinical case competitions are currently unavailable
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Publishing, entry fees, scoring, and rewards are paused until clinically reviewed cases and server-verified results are live. No entry fee has been charged.
          </p>
          <p className="text-xs text-muted-foreground">
            Your patient care, appointments, treatments, and wallet balance are not affected.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/app/gaming/tasks"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-extrabold"
          >
            <ClipboardCheck className="w-4 h-4" />
            Submit a Proactive Case Study
          </Link>
          <Link
            href="/app/ai"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl border border-border text-xs font-bold hover:bg-muted/50"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            Explore Cases in Aries Intelligence
          </Link>
        </div>
      </div>
    </div>
  );
}

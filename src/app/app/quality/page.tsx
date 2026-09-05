'use client';

import React, { useState, useEffect } from 'react';
import { useProviderAuth } from '@/services/provider-auth-context';
import { providerApi } from '@/services/provider-api';
import {
  Activity,
  Star,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Award,
  MessageSquare,
  Sparkles,
  HeartHandshake,
  Clock,
  Send,
  Loader2,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProviderQualityDashboardPage() {
  const { user } = useProviderAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await providerApi.getQualityMetrics();
      setMetrics(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Could not load your quality metrics from the server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-outfit font-extrabold tracking-tight">Clinical Quality & NPS Score</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Audited clinical compliance scores, patient satisfaction ratings, and doorstep punctuality telemetry.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl text-xs font-bold flex items-center gap-2 bg-red-500/10 text-red-600 border border-red-500/30">
          <span>{error}</span>
          <button type="button" onClick={() => load()} className="ml-auto underline">
            Retry
          </button>
        </div>
      )}

      {isLoading || !metrics ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Metrics sourced from fetchLeadsTekenAnalysis + the therapist record */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-muted-foreground">Provider Rating</span>
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-foreground">
                {metrics.averageRating ? metrics.averageRating.toFixed(1) : '—'}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">
                {metrics.cityRankPercentile !== undefined
                  ? `City rank ${Math.round(metrics.cityRankPercentile)}th percentile`
                  : 'From your provider record'}
              </div>
            </div>

            <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-muted-foreground">QA Audit Score</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-emerald-500">
                {metrics.clinicalComplianceScore ? `${metrics.clinicalComplianceScore}%` : '—'}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">Clinical governance audit</div>
            </div>

            <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-muted-foreground">On-Time Settlement</span>
                <Clock className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-sky-500">
                {metrics.onTimeArrivalRate}%
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">
                Patient {metrics.patientOnTimeRate}% · payouts {metrics.payoutOnTimeRate}%
              </div>
            </div>

            <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-muted-foreground">Lead Conversion</span>
                <HeartHandshake className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-purple-500">
                {metrics.conversionRate}%
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">Leads converted to packages</div>
            </div>
          </div>

          {/* Conversion funnel — returned by the same analytics endpoint */}
          {metrics.conversionFunnel && (
            <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-foreground">Lead Conversion Funnel</h3>
              <div className="space-y-2">
                {[
                  { label: 'Leads taken', value: metrics.conversionFunnel.leadsTaken },
                  { label: 'Assessments completed', value: metrics.conversionFunnel.assessmentsDone },
                  { label: 'Converted to package', value: metrics.conversionFunnel.convertedToPackage },
                ].map((step) => {
                  const top = metrics.conversionFunnel?.leadsTaken || 0;
                  const pct = top > 0 ? (step.value / top) * 100 : 0;
                  return (
                    <div key={step.label} className="flex items-center gap-3 text-xs">
                      <span className="w-44 font-bold shrink-0">{step.label}</span>
                      <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 font-mono text-muted-foreground text-right">{step.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Patient reviews are collected on Google, not stored per provider in this
              backend — there is no endpoint that returns them, so nothing is invented. */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-foreground">Patient Reviews</h3>
            <div className="p-6 text-center bg-muted/20 border border-dashed border-border/60 rounded-2xl">
              <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-xs font-bold text-foreground">
                Reviews are collected on your public Google listing
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-md mx-auto">
                Use “Request review” on a patient record to send the review link over WhatsApp. The
                platform does not store individual review text against your provider record, so
                neither this app nor the mobile app can list or reply to them here.
              </p>
            </div>
          </div>

        </>
      )}
    </div>
  );
}

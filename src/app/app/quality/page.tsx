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
import { Input } from '@/components/ui/input';

export default function ProviderQualityDashboardPage() {
  const { user } = useProviderAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    providerApi.getQualityMetrics().then((data) => {
      setMetrics(data);
      setIsLoading(false);
    });
  }, []);

  const handleSendReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    setMetrics({
      ...metrics,
      reviews: metrics.reviews.map((r: any) => (r.id === reviewId ? { ...r, therapistReply: replyText.trim() } : r)),
    });
    setReplyingToId(null);
    setReplyText('');
  };

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

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Main Quality Metrics Hero Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-muted-foreground">Overall Rating</span>
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-foreground">{metrics.averageRating}</div>
              <div className="text-[11px] text-amber-500 font-bold mt-1">Based on {metrics.totalReviewsCount} reviews</div>
            </div>

            <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-muted-foreground">SOAP Compliance</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-emerald-500">{metrics.clinicalComplianceScore}%</div>
              <div className="text-[11px] text-muted-foreground mt-1">Audit score by Governance</div>
            </div>

            <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-muted-foreground">On-Time Arrival</span>
                <Clock className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-sky-500">{metrics.onTimeArrivalRate}%</div>
              <div className="text-[11px] text-muted-foreground mt-1">Doorstep GPS telemetry</div>
            </div>

            <div className="bg-card border border-border/80 p-5 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-muted-foreground">Net Promoter Score</span>
                <HeartHandshake className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-3xl font-extrabold font-mono text-purple-500">+{metrics.npsScore}</div>
              <div className="text-[11px] text-emerald-500 font-bold mt-1">World-class patient trust</div>
            </div>
          </div>

          {/* 5-Star Rating Breakdown Card */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-foreground">Patient Ratings Distribution</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = metrics.ratingBreakdown[stars] || 0;
                const pct = metrics.totalReviewsCount > 0 ? (count / metrics.totalReviewsCount) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <span className="w-12 font-bold flex items-center gap-1 shrink-0">
                      <span>{stars}</span>
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    </span>
                    <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 font-mono text-muted-foreground text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Patient Reviews Feed */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-foreground">Verified Patient Feedback & Reviews</h3>

            {metrics.reviews.length === 0 ? (
              <div className="p-8 text-center bg-muted/20 border border-dashed border-border/60 rounded-2xl">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-foreground">No patient reviews yet</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Reviews submitted by patients following completed doorstep clinical sessions will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {metrics.reviews.map((rev: any) => (
                <div key={rev.id} className="p-5 rounded-2xl border border-border/60 bg-muted/20 space-y-3 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-foreground">{rev.patientName}</span>
                        <span className="text-[10px] text-muted-foreground">• {rev.date}</span>
                      </div>
                      <p className="text-[11px] text-primary font-bold mt-0.5">{rev.condition}</p>
                    </div>

                    <div className="flex items-center gap-0.5 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 text-amber-500 font-bold shrink-0">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span>{rev.rating}.0</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground leading-relaxed italic">"{rev.comment}"</p>

                  {/* Therapist Reply Section */}
                  {rev.therapistReply ? (
                    <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
                      <p className="text-[10px] font-bold text-primary flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Your Reply:</span>
                      </p>
                      <p className="text-foreground">{rev.therapistReply}</p>
                    </div>
                  ) : replyingToId === rev.id ? (
                    <div className="space-y-2 pt-1">
                      <Input
                        placeholder="Write a professional reply to patient..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="h-9 rounded-xl text-xs bg-card"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSendReply(rev.id)}
                          size="sm"
                          className="h-8 px-4 rounded-xl bg-primary text-white text-xs font-bold"
                        >
                          Post Reply
                        </Button>
                        <Button
                          onClick={() => setReplyingToId(null)}
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 rounded-xl text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setReplyingToId(rev.id);
                        setReplyText('');
                      }}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Reply to Patient</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

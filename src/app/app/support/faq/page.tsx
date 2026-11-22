'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronDown,
  FileQuestion,
  MessageSquare,
  Search,
  Ticket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState, ErrorState, PageSkeleton } from '@/components/ds';
import { useBackendQuery } from '@/hooks/use-backend-query';
import { providerApi } from '@/services/provider-api';
import { extractFaqCategories } from '@/lib/wave2-helpers';

export default function SupportFaqPage() {
  const { data, error, loading, reload } = useBackendQuery(() => providerApi.fetchFaqs(), []);
  const faqs = Array.isArray(data) ? data : [];

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [openKey, setOpenKey] = useState<string | null>(null);

  const categories = useMemo(() => ['All', ...extractFaqCategories(faqs)], [faqs]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return faqs.filter((faq: any) => {
      const cat = String(faq?.category || 'General').trim();
      if (selectedCategory !== 'All' && cat.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (!q) return true;
      const hay = `${faq.question || faq.title || ''} ${faq.answer || faq.description || ''} ${cat}`.toLowerCase();
      return hay.includes(q);
    });
  }, [faqs, search, selectedCategory]);

  if (loading) return <PageSkeleton rows={4} />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="space-y-1">
        <Link
          href="/app/support"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Support</span>
        </Link>
        <h1 className="text-2xl font-outfit font-extrabold tracking-tight">Frequently Asked Questions</h1>
        <p className="text-xs text-muted-foreground">
          Quick answers on payouts, doorstep visit workflows, onboarding verification, and safety protocols.
        </p>
      </div>

      {/* Search & Categories */}
      <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search help articles (e.g. payout date, OTP check-in, KYC, SOS)…"
            className="pl-10 h-11 rounded-2xl text-xs"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary text-white border-primary'
                  : 'bg-background text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileQuestion}
          title="No matching FAQ articles"
          description="Try a different keyword or reach out directly to AriesXpert Operations."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((faq: any, idx: number) => {
            const key = String(faq._id || faq.id || idx);
            const isOpen = openKey === key;
            return (
              <div key={key} className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenKey(isOpen ? null : key)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="space-y-1">
                    {faq.category && (
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {faq.category}
                      </span>
                    )}
                    <h3 className="text-sm font-outfit font-extrabold text-foreground">
                      {faq.question || faq.title}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-xs text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
                    {faq.answer || faq.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Still need help */}
      <div className="rounded-3xl border border-primary/25 bg-primary/5 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-outfit font-extrabold">Still have a question?</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Start a live chat with Operations Support or log a trackable support ticket.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="h-10 rounded-2xl text-xs font-bold gap-1.5">
            <Link href="/app/support/tickets">
              <Ticket className="w-3.5 h-3.5" /> Raise Ticket
            </Link>
          </Button>
          <Button asChild size="sm" className="h-10 rounded-2xl text-xs font-extrabold gap-1.5">
            <Link href="/app/chat">
              <MessageSquare className="w-3.5 h-3.5" /> Live Support Chat
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

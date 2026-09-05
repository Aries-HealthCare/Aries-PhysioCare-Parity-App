'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { providerApi } from '@/services/provider-api';
import {
  Phone,
  ShieldAlert,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertTriangle,
  LifeBuoy,
  Loader2,
  Ticket,
  FileQuestion,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Clinical helpdesk — backed by the same records the mobile support module uses:
 *   POST /api/app/supportTicket/createSupportTicket
 *   POST /api/app/supportTicket/fetchSupportTickets  { expert }
 *   POST /api/app/faq/fetchFaqs
 *   POST /api/app/quickDial/fetchQuickDials
 * Tickets raised here appear in the mobile ticket list and vice versa; the contact
 * numbers are the ones operations configured, not hard-coded placeholders.
 */

const CATEGORIES = [
  'Payment / Wallet Discrepancy',
  'Patient Attendance / Re-scheduling',
  'Clinical Escalation / Case Review',
  'App Technical Issue',
];

export default function ProviderSupportPage() {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketCategory, setTicketCategory] = useState(CATEGORIES[0]);
  const [priority, setPriority] = useState('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ ok: boolean; text: string } | null>(null);

  const [tickets, setTickets] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [quickDials, setQuickDials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    const [ticketsRes, faqsRes, dialsRes] = await Promise.allSettled([
      providerApi.getSupportTickets(),
      providerApi.fetchFaqs(),
      providerApi.getQuickDials(),
    ]);

    if (ticketsRes.status === 'fulfilled') setTickets(ticketsRes.value);
    if (faqsRes.status === 'fulfilled') setFaqs(faqsRes.value);
    if (dialsRes.status === 'fulfilled') setQuickDials(dialsRes.value);

    setLoadError(
      ticketsRes.status === 'rejected'
        ? (ticketsRes.reason as any)?.message || 'Could not load your support tickets.'
        : null
    );
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) return;

    setIsSubmitting(true);
    setSubmitResult(null);
    try {
      const res = await providerApi.createSupportTicket(
        ticketSubject.trim(),
        ticketCategory,
        priority,
        ticketDescription.trim()
      );
      if (!res.success) {
        setSubmitResult({ ok: false, text: res.message || 'The ticket could not be raised.' });
        return;
      }
      const ticketNo = res.result?.ticketNumber || res.result?.ticketId || res.result?._id;
      setSubmitResult({
        ok: true,
        text: ticketNo
          ? `Ticket ${ticketNo} raised. Operations will respond on this thread.`
          : 'Ticket raised. Operations will respond on this thread.',
      });
      setTicketSubject('');
      setTicketDescription('');
      await load();
    } catch (err: any) {
      setSubmitResult({ ok: false, text: err?.message || 'The ticket could not be raised.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">Clinical Support &amp; Helpdesk</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Operations hotline, doorstep safety protocols, and the clinical escalation desk.
          </p>
        </div>
      </div>

      {/* Emergency SOS banner — routes to the real dispatch console */}
      <div className="bg-destructive/10 border-2 border-destructive/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-destructive font-extrabold text-sm">
            <ShieldAlert className="w-5 h-5" />
            <span>Emergency Doorstep SOS Protocol</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
            For medical emergencies, patient distress, or a safety concern during a home visit, open
            the SOS hub — it opens a live dispatch session with GPS telemetry.
          </p>
        </div>

        <Link href="/app/sos" className="shrink-0">
          <Button
            type="button"
            className="h-12 px-8 rounded-2xl bg-destructive hover:bg-destructive/90 text-white font-extrabold text-sm shadow-xl shadow-destructive/20"
          >
            <span>OPEN EMERGENCY SOS HUB</span>
          </Button>
        </Link>
      </div>

      {/* Contact channels from the configured quick-dial directory */}
      <div className="bg-card border border-border/80 p-6 rounded-3xl space-y-3 shadow-sm">
        <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
          <Phone className="w-4 h-4 text-primary" />
          <span>Operations Contact Channels</span>
        </h3>

        {isLoading ? (
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Loading contact numbers…</span>
          </div>
        ) : quickDials.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No support numbers are configured for your region yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickDials.map((dial: any, index: number) => {
              const number = dial.phone || dial.number || dial.mobileNo;
              const isWhatsApp = String(dial.type || dial.channel || '').toLowerCase().includes('whatsapp');
              return (
                <a
                  key={dial._id || dial.id || index}
                  href={isWhatsApp ? `https://wa.me/${String(number).replace(/\D/g, '')}` : `tel:${number}`}
                  target={isWhatsApp ? '_blank' : undefined}
                  rel={isWhatsApp ? 'noopener noreferrer' : undefined}
                  className="p-4 rounded-2xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs font-extrabold text-foreground">
                    {isWhatsApp ? (
                      <MessageSquare className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Phone className="w-4 h-4 text-primary" />
                    )}
                    <span>{dial.title || dial.name || 'Operations Desk'}</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-muted-foreground mt-1">{number}</div>
                  {dial.description && (
                    <p className="text-[11px] text-muted-foreground mt-1">{dial.description}</p>
                  )}
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Submit a ticket */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-foreground">Submit a Support Ticket</h3>

        {submitResult && (
          <div
            className={`p-3.5 text-xs font-bold rounded-2xl flex items-center gap-2 border ${
              submitResult.ok
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                : 'bg-destructive/10 border-destructive/30 text-destructive'
            }`}
          >
            {submitResult.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{submitResult.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold">Issue Category</label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                className="w-full h-11 px-3 mt-1 bg-background border border-input rounded-xl text-xs"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-11 px-3 mt-1 bg-background border border-input rounded-xl text-xs"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold">Subject</label>
            <Input
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              placeholder="Brief summary of your query..."
              className="h-11 mt-1 rounded-xl text-xs"
              required
            />
          </div>

          <div>
            <label className="font-bold">Description &amp; Details</label>
            <textarea
              rows={3}
              value={ticketDescription}
              onChange={(e) => setTicketDescription(e.target.value)}
              placeholder="Please provide appointment ID or patient details if applicable..."
              className="w-full p-3 mt-1 bg-background border border-input rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 px-6 rounded-xl bg-primary text-white font-extrabold text-xs shadow-md"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-1.5" />
            )}
            <span>{isSubmitting ? 'Submitting…' : 'Submit Ticket'}</span>
          </Button>
        </form>
      </div>

      {/* Existing tickets */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
          <Ticket className="w-4 h-4 text-primary" />
          <span>Your Tickets</span>
        </h3>

        {loadError && (
          <div className="p-3.5 bg-destructive/10 border border-destructive/30 text-destructive text-xs font-bold rounded-2xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{loadError}</span>
            <button type="button" onClick={() => load()} className="ml-auto underline">
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Loading tickets…</span>
          </div>
        ) : tickets.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">You have no open support tickets.</p>
        ) : (
          <div className="space-y-2">
            {tickets.map((ticket: any, index: number) => (
              <div
                key={ticket._id || ticket.id || index}
                className="p-4 rounded-2xl border border-border/60 bg-muted/20 text-xs space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-foreground">{ticket.subject || 'Support ticket'}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {ticket.status || 'Open'}
                  </span>
                </div>
                <p className="text-muted-foreground">{ticket.description}</p>
                <div className="text-[10px] text-muted-foreground font-mono">
                  {ticket.category}
                  {ticket.createdAt ? ` · ${new Date(ticket.createdAt).toLocaleString('en-IN')}` : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAQs */}
      {faqs.length > 0 && (
        <div className="bg-card border border-border/80 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <FileQuestion className="w-4 h-4 text-primary" />
            <span>Frequently Asked Questions</span>
          </h3>
          <div className="space-y-2">
            {faqs.map((faq: any, index: number) => (
              <details
                key={faq._id || faq.id || index}
                className="p-4 rounded-2xl border border-border/60 bg-muted/20 text-xs"
              >
                <summary className="font-extrabold text-foreground cursor-pointer">
                  {faq.question || faq.title}
                </summary>
                <p className="text-muted-foreground mt-2 leading-relaxed">{faq.answer || faq.description}</p>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

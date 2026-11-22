'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  RefreshCw,
  Send,
  Ticket,
  X,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState, ErrorState, PageSkeleton } from '@/components/ds';
import { useBackendQuery } from '@/hooks/use-backend-query';
import { providerApi } from '@/services/provider-api';
import { useToast } from '@/hooks/use-toast';
import {
  normalizeSupportTicketPriority,
  normalizeSupportTicketStatus,
  type SupportTicketStatus,
} from '@/lib/wave2-helpers';

const CATEGORIES = [
  'Payment / Wallet Discrepancy',
  'Patient Attendance / Re-scheduling',
  'Clinical Escalation / Case Review',
  'Account & Verification',
  'App Technical Issue',
];

export default function SupportTicketsPage() {
  const { toast } = useToast();
  const { data, error, loading, reload } = useBackendQuery(() => providerApi.getSupportTickets(), []);
  const tickets = Array.isArray(data) ? data : [];

  const [statusFilter, setStatusFilter] = useState<'all' | SupportTicketStatus>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const normalized = useMemo(
    () =>
      tickets.map((t: any, idx: number) => ({
        ...t,
        _key: t._id || t.id || `ticket_${idx}`,
        _status: normalizeSupportTicketStatus(t.status),
        _priority: normalizeSupportTicketPriority(t.priority),
      })),
    [tickets]
  );

  const counts = useMemo(
    () => ({
      open: normalized.filter((t) => t._status === 'open').length,
      pending: normalized.filter((t) => t._status === 'pending').length,
      resolved: normalized.filter((t) => t._status === 'resolved').length,
    }),
    [normalized]
  );

  const filtered = useMemo(
    () => (statusFilter === 'all' ? normalized : normalized.filter((t) => t._status === statusFilter)),
    [normalized, statusFilter]
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast({ title: 'Missing fields', description: 'Enter both a subject and details.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await providerApi.createSupportTicket(subject.trim(), category, priority, description.trim());
      if (!res.success) throw new Error(res.message || 'Could not raise ticket.');
      toast({
        title: 'Support ticket raised',
        description: 'High priority tickets are typically addressed within 2–4 hours.',
      });
      setSubject('');
      setDescription('');
      setShowCreate(false);
      await reload();
    } catch (err: any) {
      toast({
        title: 'Ticket creation failed',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageSkeleton rows={4} />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/app/support"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Support</span>
          </Link>
          <h1 className="text-2xl font-outfit font-extrabold tracking-tight">Support Tickets</h1>
          <p className="text-xs text-muted-foreground">
            Track open clinical, payout, and technical escalations raised with AriesXpert Operations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={reload} className="h-10 rounded-2xl text-xs font-bold gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
          <Button type="button" size="sm" onClick={() => setShowCreate(true)} className="h-10 rounded-2xl text-xs font-extrabold gap-1.5">
            <Plus className="w-4 h-4" />
            <span>New Ticket</span>
          </Button>
        </div>
      </div>

      {/* 3-Box Summary */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-3xl border border-amber-500/25 bg-amber-500/5 p-4 sm:p-5">
          <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Open</p>
          <p className="text-2xl sm:text-3xl font-mono font-black mt-1">{counts.open}</p>
        </div>
        <div className="rounded-3xl border border-primary/25 bg-primary/5 p-4 sm:p-5">
          <p className="text-[11px] font-bold text-primary">In Progress</p>
          <p className="text-2xl sm:text-3xl font-mono font-black mt-1">{counts.pending}</p>
        </div>
        <div className="rounded-3xl border border-emerald-500/25 bg-emerald-500/5 p-4 sm:p-5">
          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Resolved</p>
          <p className="text-2xl sm:text-3xl font-mono font-black mt-1">{counts.resolved}</p>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(['all', 'open', 'pending', 'resolved'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                statusFilter === st
                  ? 'bg-primary text-white border-primary'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {st === 'all' ? `All (${normalized.length})` : st === 'pending' ? 'In Progress' : st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
        <Link href="/app/chat" className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5" /> Need live operations chat?
        </Link>
      </div>

      {/* Ticket List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No tickets in this view"
          description="Need help with a payout, appointment, or technical issue? Raise a new support ticket anytime."
          actionLabel="Create Support Ticket"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((ticket: any) => {
            const statusClasses =
              ticket._status === 'resolved'
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                : ticket._status === 'pending'
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-amber-500/10 text-amber-600 border-amber-500/30';
            const priorityClasses =
              ticket._priority === 'urgent' || ticket._priority === 'high'
                ? 'bg-rose-500/10 text-rose-500'
                : ticket._priority === 'medium'
                  ? 'bg-amber-500/10 text-amber-600'
                  : 'bg-muted text-muted-foreground';
            return (
              <button
                key={ticket._key}
                type="button"
                onClick={() => setSelectedTicket(ticket)}
                className="text-left rounded-3xl border border-border/80 bg-card p-5 shadow-sm hover:border-primary/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusClasses}`}>
                    {ticket._status === 'pending' ? 'In Progress' : ticket._status}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${priorityClasses}`}>
                    {ticket._priority} priority
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-outfit font-extrabold text-foreground line-clamp-1">
                    {ticket.subject || 'Support Request'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ticket.description}</p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/60">
                  <span className="truncate">{ticket.category || 'General'}</span>
                  <span className="font-mono shrink-0 flex items-center gap-1">
                    {ticket._status === 'resolved' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Clock className="w-3 h-3" />}
                    {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-card border border-border rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-outfit font-extrabold">Raise a Support Ticket</h3>
              <button type="button" onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              High priority tickets are typically addressed within 2–4 hours. Standard tickets may take up to 24–48 hours.
            </p>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Category</Label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Priority</Label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold">Subject *</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of the issue"
                  className="h-10 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold">Details *</Label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Include appointment ID, transaction reference, or patient details if relevant…"
                  className="w-full p-3 rounded-xl border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="rounded-xl font-bold gap-1.5">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Submit Ticket</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="bg-card border border-border rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-border">
              <div>
                <p className="text-[10px] font-mono text-muted-foreground">
                  {selectedTicket.ticketNumber || selectedTicket.ticketId || selectedTicket._key}
                </p>
                <h3 className="text-base font-outfit font-extrabold mt-0.5">{selectedTicket.subject}</h3>
              </div>
              <button type="button" onClick={() => setSelectedTicket(null)} className="p-1 rounded-lg hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase">
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary">{selectedTicket._status}</span>
              <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{selectedTicket._priority} priority</span>
              {selectedTicket.category && (
                <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground">{selectedTicket.category}</span>
              )}
            </div>
            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
            {selectedTicket.resolutionNote && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-xs">
                <p className="font-bold text-emerald-600 mb-1">Operations Response</p>
                <p className="text-foreground">{selectedTicket.resolutionNote}</p>
              </div>
            )}
            <Button type="button" onClick={() => setSelectedTicket(null)} className="w-full rounded-2xl h-10 text-xs font-bold">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

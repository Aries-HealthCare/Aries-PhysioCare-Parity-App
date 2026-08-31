'use client';

import React, { useState } from 'react';
import {
  HelpCircle,
  Phone,
  ShieldAlert,
  MessageSquare,
  FileQuestion,
  Send,
  CheckCircle2,
  AlertTriangle,
  LifeBuoy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProviderSupportPage() {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Payment / Wallet Discrepancy');
  const [submitted, setSubmitted] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDescription) return;
    setSubmitted(true);
    setTimeout(() => {
      setTicketSubject('');
      setTicketDescription('');
      setSubmitted(false);
    }, 3000);
  };

  const handleTriggerSOS = () => {
    setSosTriggered(true);
    setTimeout(() => {
      alert('🚨 EMERGENCY SOS DISPATCH: Location coordinates broadcast to Territory Operations Manager and Clinical Director.');
      setSosTriggered(false);
    }, 400);
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
            <h1 className="text-2xl font-extrabold tracking-tight">Clinical Support & Emergency SOS</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            24x7 Operations hotline, doorstep safety protocols, and direct clinical escalation desk.
          </p>
        </div>
      </div>

      {/* Emergency SOS Banner */}
      <div className="bg-destructive/10 border-2 border-destructive/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-destructive font-extrabold text-sm">
            <ShieldAlert className="w-5 h-5 animate-bounce" />
            <span>Emergency Doorstep SOS Protocol</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
            In case of clinical medical emergencies, patient cardiac distress, or safety concerns during a home visit, trigger SOS immediately.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleTriggerSOS}
          disabled={sosTriggered}
          className="h-12 px-8 rounded-2xl bg-destructive hover:bg-destructive/90 text-white font-extrabold text-sm shadow-xl shadow-destructive/20 shrink-0"
        >
          <span>TRIGGER EMERGENCY SOS</span>
        </Button>
      </div>

      {/* Contact Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border/80 p-6 rounded-3xl space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-foreground">24x7 Operations Helpline</h3>
          <p className="text-xs text-muted-foreground">
            Direct phone line with your territory coordinator for visit re-scheduling or address assistance.
          </p>
          <a
            href="tel:+919820000000"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline font-mono pt-1"
          >
            <Phone className="w-4 h-4" />
            <span>+91 98200 00000 (Mumbai Ops Desk)</span>
          </a>
        </div>

        <div className="bg-card border border-border/80 p-6 rounded-3xl space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-foreground">WhatsApp Provider Desk</h3>
          <p className="text-xs text-muted-foreground">
            Instant chat with operations for fast equipment dispatch or clinical queries.
          </p>
          <a
            href="https://wa.me/919820000000"
            target="_blank"
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-500 hover:underline pt-1"
          >
            <span>Open WhatsApp Chat →</span>
          </a>
        </div>
      </div>

      {/* Support Ticket Submission */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-foreground">Submit a Support Ticket</h3>

        {submitted && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Ticket #AX-8912 submitted. Our operations team will respond within 30 minutes.</span>
          </div>
        )}

        <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
          <div>
            <label className="font-bold">Issue Category</label>
            <select
              value={ticketCategory}
              onChange={(e) => setTicketCategory(e.target.value)}
              className="w-full h-11 px-3 mt-1 bg-background border border-input rounded-xl text-xs"
            >
              <option value="Payment / Wallet Discrepancy">Payment / Wallet Discrepancy</option>
              <option value="Patient Attendance / Re-scheduling">Patient Attendance / Re-scheduling</option>
              <option value="Clinical Escalation / Case Review">Clinical Escalation / Case Review</option>
              <option value="App Technical Issue">App Technical Issue</option>
            </select>
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
            <label className="font-bold">Description & Details</label>
            <textarea
              rows={3}
              value={ticketDescription}
              onChange={(e) => setTicketDescription(e.target.value)}
              placeholder="Please provide appointment ID or patient details if applicable..."
              className="w-full p-3 mt-1 bg-background border border-input rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <Button type="submit" className="h-11 px-6 rounded-xl bg-primary text-white font-extrabold text-xs shadow-md">
            <Send className="w-4 h-4 mr-1.5" />
            <span>Submit Ticket</span>
          </Button>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PageHeader, ErrorState, EmptyState, PageSkeleton } from '@/components/ds';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBackendQuery } from '@/hooks/use-backend-query';
import { useToast } from '@/hooks/use-toast';
import { providerApi } from '@/services/provider-api';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Search,
  AudioLines,
  Bot,
  Clock,
  Loader2,
  Stethoscope,
} from 'lucide-react';

const CLINICAL_DOMAINS = [
  { id: 'general', label: 'General Clinical' },
  { id: 'musculoskeletal', label: 'Musculoskeletal' },
  { id: 'neurology', label: 'Neurology' },
  { id: 'post-surgical', label: 'Post-Surgical' },
  { id: 'cardiopulmonary', label: 'Cardiopulmonary' },
  { id: 'geriatrics', label: 'Geriatrics' },
] as const;

const QUICK_PROMPTS = [
  'Evidence-based Phase 2 ACL reconstruction progression criteria',
  'Differentiate piriformis syndrome vs L5-S1 radiculopathy',
  'Home balance & fall-prevention protocol for 72yo post-stroke patient',
  'Contraindications for ultrasound & IFT in patients with implants',
];

function extractAnswer(result: any): string {
  if (!result) return '';
  if (typeof result === 'string') return result;
  return (
    result.reply ||
    result.answer ||
    result.response ||
    result.consultation?.response ||
    result.consultation?.answer ||
    result.message ||
    ''
  );
}

export default function IntelligencePage() {
  const { toast } = useToast();
  const { data: history, error, loading, reload } = useBackendQuery(() => providerApi.getAiHistory(), []);

  const [domain, setDomain] = useState<string>('general');
  const [prompt, setPrompt] = useState('');
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [activeDomain, setActiveDomain] = useState<string>('general');
  const [reply, setReply] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const filteredHistory = useMemo(() => {
    const items = Array.isArray(history) ? history : [];
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item: any) => {
      const text = `${item.query || item.prompt || item.question || ''} ${
        item.response || item.reply || item.answer || ''
      } ${item.domain || ''}`.toLowerCase();
      return text.includes(q);
    });
  }, [history, searchTerm]);

  const handleConsult = async (customPrompt?: string) => {
    const text = (customPrompt ?? prompt).trim();
    if (!text) return;

    setBusy(true);
    setAskError(null);
    setActiveQuery(text);
    setActiveDomain(domain);
    try {
      const result = await providerApi.aiConsult(text, { domain });
      const answer = extractAnswer(result);
      if (!answer) {
        throw new Error('The AI consultant returned an empty response. Please try rephrasing.');
      }
      setReply(answer);
      if (!customPrompt) setPrompt('');
      await reload();
    } catch (err: any) {
      const msg = err?.message || 'Clinical consultation failed. Please try again.';
      setAskError(msg);
      toast({
        title: 'Consultation unavailable',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = () => {
    if (!reply) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(reply);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    toast({ title: 'Clinical brief copied to clipboard' });
  };

  const handleToggleSpeak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !reply) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(reply.replace(/[*#_`]/g, ''));
    utterance.lang = 'en-IN';
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        eyebrow="Growth"
        title="Aries Intelligence"
        description="Evidence-based clinical reference copilot synced with your consultation history across web and mobile."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/app/ai/avatar"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-primary text-primary-foreground text-xs font-bold shadow-sm hover:opacity-95 transition-opacity"
            >
              <AudioLines className="w-4 h-4" />
              Voice Avatar Studio
            </Link>
            <Link
              href="/app/buddy"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-border bg-card text-foreground text-xs font-bold hover:bg-muted/50 transition-colors"
            >
              <Bot className="w-4 h-4" />
              Buddy Hub
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Clinical Query Composer + Active Response */}
        <div className="lg:col-span-7 space-y-4">
          <form
            className="space-y-4 rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm"
            onSubmit={(e) => {
              e.preventDefault();
              void handleConsult();
            }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-primary" />
                  Clinical Specialty Domain
                </span>
                <span className="text-[11px] text-muted-foreground">Cmd/Ctrl + Enter to submit</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CLINICAL_DOMAINS.map((d) => {
                  const active = domain === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDomain(d.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        active
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-muted/30 text-muted-foreground border-border/70 hover:text-foreground'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <textarea
              className="w-full min-h-32 rounded-2xl border border-border bg-background p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  void handleConsult();
                }
              }}
              placeholder="Ask a clinical physiotherapy, differential diagnosis, modality safety, or care-plan question…"
              disabled={busy}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                type="submit"
                disabled={busy || !prompt.trim()}
                className="rounded-2xl px-5 h-10 text-xs font-bold"
              >
                {busy ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Consulting…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1.5" />
                    Ask Aries Intelligence
                  </>
                )}
              </Button>
              <span className="text-[11px] text-muted-foreground">
                Clinical decision support only — verify against patient history.
              </span>
            </div>

            {askError ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-semibold text-destructive">
                {askError}
              </div>
            ) : null}

            {/* Quick Starter Prompts */}
            <div className="pt-2 border-t border-border/60 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Quick Clinical Starters
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    disabled={busy}
                    onClick={() => void handleConsult(q)}
                    className="text-left p-3 rounded-2xl border border-border/70 bg-muted/20 hover:bg-primary/5 hover:border-primary/40 text-xs text-foreground transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </form>

          {/* Latest / Selected Answer Reader */}
          {reply ? (
            <div className="rounded-3xl border border-primary/25 bg-card p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-border/60">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      <Sparkles className="w-3 h-3" />
                      {activeDomain}
                    </span>
                  </div>
                  {activeQuery ? (
                    <h2 className="text-sm font-extrabold text-foreground leading-snug">{activeQuery}</h2>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleToggleSpeak}
                    className="h-8 rounded-xl text-xs"
                  >
                    {speaking ? <VolumeX className="w-3.5 h-3.5 mr-1" /> : <Volume2 className="w-3.5 h-3.5 mr-1" />}
                    {speaking ? 'Stop' : 'Listen'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    className="h-8 rounded-xl text-xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {reply}
              </div>
            </div>
          ) : null}
        </div>

        {/* Right: Searchable Consultation History */}
        <aside className="lg:col-span-5 rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-extrabold text-foreground">Consultation History</h2>
              <p className="text-[11px] text-muted-foreground">
                Click any past consultation to open it in the reader
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
              {(history || []).length}
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search past clinical consults…"
              className="pl-9 h-10 rounded-2xl text-xs"
            />
          </div>

          {loading ? <PageSkeleton rows={4} /> : null}
          {error ? <ErrorState error={error} onRetry={reload} /> : null}

          {!loading && !error && filteredHistory.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title={searchTerm ? 'No matching consults' : 'No consultation history yet'}
              description={
                searchTerm
                  ? 'Try a broader search term or specialty keyword.'
                  : 'Previous clinical consultations from mobile and web will appear here.'
              }
            />
          ) : (
            <ul className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredHistory.map((item: any, i: number) => {
                const qText = item.query || item.prompt || item.question || 'Clinical consultation';
                const aText = item.response || item.reply || item.answer || '';
                const dLabel = item.domain || 'general';
                const created = item.createdAt || item.timestamp;
                return (
                  <li key={item._id || item.id || i}>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveQuery(qText);
                        setActiveDomain(dLabel);
                        setReply(aText || 'No answer text recorded for this entry.');
                      }}
                      className="w-full text-left rounded-2xl border border-border/70 bg-muted/20 hover:bg-primary/5 hover:border-primary/40 p-3.5 transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                        <span className="uppercase font-bold text-primary">{dLabel}</span>
                        {created ? (
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {new Date(created).toLocaleDateString()}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs font-bold text-foreground line-clamp-2">{qText}</p>
                      {aText ? (
                        <p className="text-[11px] text-muted-foreground line-clamp-2">{aText}</p>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}

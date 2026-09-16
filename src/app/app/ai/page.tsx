'use client';

import { useState } from 'react';
import { PageHeader, ErrorState, EmptyState, PageSkeleton } from '@/components/ds';
import { Button } from '@/components/ui/button';
import { useBackendQuery } from '@/hooks/use-backend-query';
import { providerApi } from '@/services/provider-api';
import { Sparkles } from 'lucide-react';

export default function IntelligencePage() {
  const { data: history, error, loading, reload } = useBackendQuery(() => providerApi.getAiHistory(), []);
  const [prompt, setPrompt] = useState('');
  const [reply, setReply] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        eyebrow="Growth"
        title="Aries Intelligence"
        description="POST /api/app/ai/consult — the same copilot as AriesXpertV2. No placeholder answers."
      />
      <form
        className="space-y-3 rounded-3xl border border-border bg-card p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!prompt.trim()) return;
          setBusy(true);
          setAskError(null);
          try {
            const result = await providerApi.aiConsult(prompt.trim());
            const text = result?.reply || result?.answer || result?.message || JSON.stringify(result);
            setReply(text);
            await reload();
          } catch (err: any) {
            setAskError(err?.message || 'Consult failed');
          } finally {
            setBusy(false);
          }
        }}
      >
        <textarea
          className="w-full min-h-28 rounded-2xl border border-border bg-background p-3 text-sm"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask a clinical or operational question"
        />
        <Button type="submit" disabled={busy} className="rounded-2xl">
          {busy ? 'Consulting…' : 'Ask'}
        </Button>
        {askError ? <p className="text-sm text-destructive">{askError}</p> : null}
        {reply ? <div className="rounded-2xl bg-muted/40 p-4 text-sm whitespace-pre-wrap">{reply}</div> : null}
      </form>
      {loading ? <PageSkeleton rows={3} /> : null}
      {error ? <ErrorState error={error} onRetry={reload} /> : null}
      {!loading && !(history || []).length ? (
        <EmptyState icon={Sparkles} title="No consult history" description="Previous AI consults from mobile and web appear here." />
      ) : (
        <ul className="space-y-2">
          {(history || []).map((item: any, i: number) => (
            <li key={item._id || i} className="rounded-2xl border border-border p-3 text-sm">
              <p className="font-bold">{item.prompt || item.question}</p>
              <p className="text-muted-foreground mt-1">{item.reply || item.answer}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

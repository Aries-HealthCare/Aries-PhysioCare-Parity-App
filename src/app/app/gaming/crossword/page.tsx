'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { providerApi } from '@/services/provider-api';
import { useToast } from '@/hooks/use-toast';
import { ArenaHeader, RewardsPausedNotice } from '@/components/gaming/arena-shell';
import { isRewardsPausedError, validateSecureCrossword } from '@/lib/gaming-helpers';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Puzzle, RotateCcw } from 'lucide-react';

// Unrated local practice crossword (0 coins) offered only when server crossword is in maintenance
const PRACTICE_LAYOUT = [
  ['X', 'X', 'X', 'X', 'X', ''], // Row 0: FEMUR (across 0,0)
  ['', '', '', '', 'X', ''],    // Col 4: REHAB (down 0,4 -> R,E,H,A,B)
  ['X', 'X', 'X', 'X', 'X', ''], // Row 2: SPINE? Wait: col 4 is H -> T H I G H (0..4) -> let's verify!
  ['', '', '', '', 'X', ''],
  ['', 'X', 'X', 'X', 'X', ''], // Row 4: col 4 is B -> L I M B (cols 1..4)
];
const PRACTICE_SOLUTION = [
  ['F', 'E', 'M', 'U', 'R', ''],
  ['', '', '', '', 'E', ''],
  ['T', 'H', 'I', 'G', 'H', ''],
  ['', '', '', '', 'A', ''],
  ['', 'L', 'I', 'M', 'B', ''],
];
const PRACTICE_CLUES = {
  across: [
    { num: '1', clue: 'Longest and strongest bone in the human body (5)', row: 0, col: 0 },
    { num: '3', clue: 'Upper leg anatomical region housing the quadriceps (5)', row: 2, col: 0 },
    { num: '4', clue: 'An upper or lower extremity (4)', row: 4, col: 1 },
  ],
  down: [
    { num: '2', clue: 'Short clinical term for physical rehabilitation (5)', row: 0, col: 4 },
  ],
};

export default function CrosswordGamePage() {
  const { toast } = useToast();
  const [coins, setCoins] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [pausedMsg, setPausedMsg] = useState<string | null>(null);
  const [mode, setMode] = useState<'SERVER' | 'PRACTICE'>('SERVER');

  // Server crossword state
  const [serverCrossword, setServerCrossword] = useState<any | null>(null);
  const [layout, setLayout] = useState<string[][]>([]);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [practiceSolved, setPracticeSolved] = useState(false);

  const initPractice = useCallback(() => {
    setMode('PRACTICE');
    setLayout(PRACTICE_LAYOUT);
    setUserGrid(PRACTICE_LAYOUT.map((row) => row.map((c) => (c === 'X' ? '' : '#'))));
    setPracticeSolved(false);
  }, []);

  const loadServer = useCallback(async () => {
    setLoading(true);
    setPausedMsg(null);
    const [p, cw] = await Promise.allSettled([
      providerApi.getGamingProfile(),
      providerApi.getActiveCrossword(),
    ]);
    if (p.status === 'fulfilled' && typeof p.value?.coins === 'number') setCoins(p.value.coins);

    if (cw.status === 'fulfilled' && cw.value) {
      const payload = cw.value.crossword || cw.value;
      const validated = validateSecureCrossword(payload);
      if (validated.valid) {
        setServerCrossword(payload);
        setMode('SERVER');
        setLayout(validated.layout);
        setUserGrid(validated.layout.map((row) => row.map((c) => (c === 'X' ? '' : '#'))));
      } else {
        setPausedMsg(validated.reason || 'Daily crossword format is currently unavailable.');
        initPractice();
      }
    } else if (cw.status === 'rejected') {
      const err = cw.reason;
      setPausedMsg(
        isRewardsPausedError(err)
          ? err?.message
          : 'Live server crossword is temporarily unavailable — unrated practice mode is ready below.'
      );
      initPractice();
    }
    setLoading(false);
  }, [initPractice]);

  useEffect(() => {
    void loadServer();
  }, [loadServer]);

  const updateCell = (r: number, c: number, val: string) => {
    const ch = val.replace(/[^a-zA-Z]/g, '').slice(-1).toUpperCase();
    setUserGrid((prev) =>
      prev.map((row, rIdx) => (rIdx === r ? row.map((cell, cIdx) => (cIdx === c ? ch : cell)) : row))
    );
  };

  const handleSubmit = async () => {
    if (mode === 'PRACTICE') {
      let allMatch = true;
      for (let r = 0; r < PRACTICE_SOLUTION.length; r += 1) {
        for (let c = 0; c < PRACTICE_SOLUTION[r].length; c += 1) {
          if (PRACTICE_SOLUTION[r][c] && userGrid[r]?.[c] !== PRACTICE_SOLUTION[r][c]) {
            allMatch = false;
          }
        }
      }
      if (allMatch) {
        setPracticeSolved(true);
        toast({ title: 'Practice Crossword Solved!', description: 'Unrated practice complete (0 coins).' });
      } else {
        toast({
          title: 'Some letters do not match yet',
          description: 'Review the Across & Down clues and try again.',
          variant: 'destructive',
        });
      }
      return;
    }

    if (!serverCrossword?._id) return;
    setSubmitting(true);
    try {
      const res = await providerApi.submitCrossword({
        crosswordId: serverCrossword._id,
        userGrid,
      });
      toast({ title: 'Crossword submitted!', description: res?.message || 'Server graded your grid.' });
    } catch (err: any) {
      toast({
        title: 'Submission unavailable',
        description: err?.message || 'Could not submit crossword.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const cellNumberAt = (r: number, c: number): string | null => {
    if (mode !== 'PRACTICE') return null;
    if (r === 0 && c === 0) return '1';
    if (r === 0 && c === 4) return '2';
    if (r === 2 && c === 0) return '3';
    if (r === 4 && c === 1) return '4';
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <ArenaHeader
        title="Clinical Anatomy Crossword"
        description={
          mode === 'SERVER'
            ? 'Server-validated daily crossword — zero client answer keys.'
            : 'Unrated Practice Mode (0 coins) while live server crossword rewards undergo maintenance.'
        }
        coins={coins}
      />

      {pausedMsg ? <RewardsPausedNotice compact message={pausedMsg} /> : null}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Interactive Grid */}
          <div className="lg:col-span-7 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary">
                <Puzzle className="w-4 h-4" />
                {mode === 'SERVER'
                  ? serverCrossword?.title || 'Daily Clinical Crossword'
                  : 'Unrated Practice Crossword (0 Coins)'}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => (mode === 'PRACTICE' ? initPractice() : void loadServer())}
                className="rounded-xl text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Clear Grid
              </Button>
            </div>

            <div className="overflow-x-auto">
              <div
                className="grid gap-1.5 mx-auto w-fit"
                style={{ gridTemplateColumns: `repeat(${layout[0]?.length || 6}, minmax(0, 1fr))` }}
              >
                {layout.map((row, r) =>
                  row.map((cell, c) => {
                    if (cell !== 'X') {
                      return (
                        <div
                          key={`${r}-${c}`}
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-900/90 dark:bg-slate-950 border border-border/30"
                        />
                      );
                    }
                    const num = cellNumberAt(r, c);
                    return (
                      <div key={`${r}-${c}`} className="relative w-11 h-11 sm:w-12 sm:h-12">
                        {num && (
                          <span className="absolute top-0.5 left-1.5 text-[9px] font-mono font-bold text-muted-foreground pointer-events-none">
                            {num}
                          </span>
                        )}
                        <input
                          type="text"
                          inputMode="text"
                          maxLength={1}
                          aria-label={`Row ${r + 1} Column ${c + 1}`}
                          value={userGrid[r]?.[c] || ''}
                          onChange={(e) => updateCell(r, c, e.target.value)}
                          className="w-full h-full rounded-xl border-2 border-border bg-background text-center font-outfit text-base sm:text-lg font-black uppercase text-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {practiceSolved && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Every clue solved accurately!
              </div>
            )}

            <Button
              type="button"
              disabled={submitting}
              onClick={() => void handleSubmit()}
              className="w-full h-11 rounded-2xl text-xs font-extrabold"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === 'SERVER' ? (
                'Submit Crossword to Server'
              ) : (
                'Check Practice Answers'
              )}
            </Button>
          </div>

          {/* Clues Panel */}
          <aside className="lg:col-span-5 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div className="space-y-2.5">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-primary">Across</h2>
              <ul className="space-y-2 text-xs">
                {(mode === 'SERVER' ? serverCrossword?.cluesAcross || [] : PRACTICE_CLUES.across).map(
                  (clue: any, idx: number) => (
                    <li key={idx} className="p-3 rounded-2xl bg-muted/20 border border-border/60">
                      <span className="font-mono font-black text-primary mr-2">
                        {clue.num || clue.clueNumber || idx + 1}.
                      </span>
                      <span className="text-foreground">{clue.clue || clue.text || String(clue)}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="space-y-2.5">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-primary">Down</h2>
              <ul className="space-y-2 text-xs">
                {(mode === 'SERVER' ? serverCrossword?.cluesDown || [] : PRACTICE_CLUES.down).map(
                  (clue: any, idx: number) => (
                    <li key={idx} className="p-3 rounded-2xl bg-muted/20 border border-border/60">
                      <span className="font-mono font-black text-primary mr-2">
                        {clue.num || clue.clueNumber || idx + 1}.
                      </span>
                      <span className="text-foreground">{clue.clue || clue.text || String(clue)}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
